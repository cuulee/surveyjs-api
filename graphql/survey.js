module.exports = () => {
  return {
    Query: {
      surveyByUID: async (parent, args, ctx) => {
        return ctx.context.getObject("Survey", {
          where: { uid: args.uid }
        });
      },
      surveyAnswerByUID: (parent, args, ctx) => {
        return ctx.context.getObject("SurveyAnswer", {
          where: { uid: args.uid }
        });
      }
    },
    Mutation: {
      updateSurveyByUID: async (_, args, ctx) => {
        let survey = await ctx.context.getObject("Survey", {
          where: { uid: args.uid }
        });
        survey.setValues(args.input);
        await ctx.context.save();
        return survey;
      },
      updateSurveyAnswerByUID: async (_, args, ctx) => {
        let answer = await ctx.context.getObject("SurveyAnswer", {
          where: { uid: args.uid }
        });
        answer.setValues(args.input);
        await ctx.context.save();
        return answer;
      }
    },
    SurveyAnswerByUID: {
      survey: answer => {
        return answer.getSurvey();
      }
    },
    SurveyByUID: {
      propertyGroups: survey => {
        return survey.getPropertyGroups();
      }
    },
    SurveyPropertyGroupByUID: {
      properties: propertyGroup => {
        return propertyGroup.getProperties();
      }
    }
  };
};
