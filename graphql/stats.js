module.exports = () => {
  return {
    Query: {
      surveyStats: async (parent, args, ctx) => {
        let survey = await ctx.context.getObject("Survey", {
          where: { uid: args.survey }
        });
        return survey;
      }
    },
    SurveyStats: {
      answers: async (survey, args, ctx) => {
        let tags = args.tags;
        let count = survey.getAnswerCount(tags);
        let metrics = survey.getAnswerMetrics(tags);
        let occurencies = await survey.getAnswerOccurencies(tags);
        console.log("??", occurencies);
        return {
          count,
          metrics,
          occurencies
        };
      }
    }
  };
};
