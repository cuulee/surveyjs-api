const ManagedObject = require("js-core-data").ManagedObject;

class SurveyAnswer extends ManagedObject {
  async willSave() {
    await super.willSave();

    if (this.sent) {
      await this.updateStats();
    }
  }

  async updateStats() {
    let context = this.managedObjectContext;

    let survey = await this.getSurvey();

    if (!survey) {
      throw new Error("answer has no survey assigned");
    }

    let surveyQuestions = await survey.getQuestions();

    let stats = await this.getStats();

    let statsToDelete = {};
    for (let stat of stats) {
      statsToDelete[stat.key] = statsToDelete[stat.key] || [];
      statsToDelete[stat.key].push(stat);
    }

    let content = JSON.parse(this.content);
    let flatContent = flatten(content);

    let newStats = [];
    for (let key in flatContent) {
      let value = flatContent[key];
      let values = null;
      if (Array.isArray(value)) {
        values = value;
      } else {
        values = [value];
      }

      for (let val of values) {
        newStats.push({
          key,
          value: val,
          type: typeof val
        });

        let firstKey = key.split(".")[0];
        if (surveyQuestions[firstKey].groups.length > 0) {
          for (let group of surveyQuestions[firstKey].groups) {
            for (let prop of group.properties) {
              newStats.push({
                key: `$${group.name}.${prop}`,
                value: val,
                type: typeof val
              });
            }
          }
        }
      }
    }

    for (let statData of newStats) {
      if (
        statsToDelete[statData.key] &&
        statsToDelete[statData.key].length > 0
      ) {
        let stat = statsToDelete[statData.key].shift();
        stat.value = statData.value;
        stat.type = statData.type;
      } else {
        let stat = context.create("SurveyAnswerStat", statData);
        this.addStat(stat);
      }
    }

    for (let statKey in statsToDelete) {
      for (let stat of statsToDelete[statKey]) {
        context.deleteObject(stat);
      }
    }
  }
}

module.exports = SurveyAnswer;

function flatten(object, separator = ".") {
  const isValidObject = value => {
    if (!value) {
      return false;
    }

    const isArray = Array.isArray(value);
    const isObject =
      Object.prototype.toString.call(value) === "[object Object]";
    const hasKeys = !!Object.keys(value).length;

    return !isArray && isObject && hasKeys;
  };

  const walker = (child, path = []) => {
    return Object.assign(
      {},
      ...Object.keys(child).map(
        key =>
          isValidObject(child[key])
            ? walker(child[key], path.concat([key]))
            : { [path.concat([key]).join(separator)]: child[key] }
      )
    );
  };

  return Object.assign({}, walker(object));
}
