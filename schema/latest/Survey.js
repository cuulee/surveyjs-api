const ManagedObject = require("js-core-data").ManagedObject;

class Survey extends ManagedObject {
  async getAnswerCount(tags) {
    let context = this.managedObjectContext;
    return context.getObjectsCount("SurveyAnswer", {
      where: {
        "SELF.survey_id": this.id,
        "SELF.tags.code": tags,
        "SELF.sent!": null
      }
    });
  }

  async getAnswerMetrics(tags) {
    let context = this.managedObjectContext;
    return context.fetch("SurveyAnswerStat", {
      fields: {
        key: "SELF.key",
        min: "MIN(value)",
        max: "MAX(value)",
        average: "AVG(value)"
      },
      where: {
        type: "number",
        "SELF.answer.survey_id": this.id,
        "SELF.answer.tags.code": tags,
        "SELF.answer.sent!": null
      },
      group: "SELF.key"
    });
  }

  async getAnswerOccurencies(tags) {
    let context = this.managedObjectContext;
    return context.fetch("SurveyAnswerStat", {
      fields: {
        key: "SELF.key",
        count: "COUNT(SELF.id)",
        value: "SELF.value",
        type: "SELF.type"
      },
      where: {
        "SELF.answer.survey_id": this.id,
        "SELF.answer.tags.code": tags,
        "SELF.answer.sent!": null
      },
      group: "SELF.key,SELF.value,SELF.type"
    });
  }

  async getPropertyGroupCodes() {
    let groups = await this.getPropertyGroups();
    return groups.map(x => x.code);
  }

  async getQuestions() {
    let groupCodes = await this.getPropertyGroupCodes();

    let content = JSON.parse(this.content);

    let questions = {};

    for (let page of content.pages) {
      let elements = page.elements.map(elm => {
        let groups = groupCodes
          .map(g => (elm[g] ? { name: g, properties: elm[g] } : null))
          .filter(x => x);
        return { name: elm.name, groups };
      });
      for (let elm of elements) {
        questions[elm.name] = elm;
      }
    }
    return questions;
  }
}

module.exports = Survey;
