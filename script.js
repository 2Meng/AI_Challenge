// Dependencies
const { OpenAI } = require("langchain/llms/openai");
const { PromptTemplate } = require("langchain/prompts");
const { StructuredOutputParser } = require("langchain/output_parsers");
const inquirer = require("inquirer");
require("dotenv").config();

// Creates and stores our API package with basic configuration
const model = new OpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  temperature: 0,
  model: "gpt-3.5-turbo",
});

// With a `StructuredOutputParser` we can define a schema for the output.
const parser = StructuredOutputParser.fromNamesAndDescriptions({
  // Define the output variables and their descriptions
  Korean: "the user's word or phrase translated in korean",
  French: "the user's word or phrase translated in french",
  Spanish: "the user's word or phrase translated in spanish",
  German: "the user's word or phrase translated in german",
});

const formatInstructions = parser.getFormatInstructions();

// Awaits the init inquirer prompt and makes a call to the openAI API
const promptFunc = async (input) => {
  try {
    // Instantiation of a new object called "prompt" using the "PromptTemplate" class
    const prompt = new PromptTemplate({
      template:
        "You are a helpful translator that understands all of the current languages in the world. You will translate anything that is asked of you while also understanding that phrases and addages may get lost in translation. In those cases, you will return a translated version of the user's phrase in a close approximation\n{format_instructions}\n{question}",
      inputVariables: ["question"],
      partialVariables: { format_instructions: formatInstructions },
    });
    const promptInput = await prompt.format({
      question: input,
    });
    const res = await model.call(promptInput);
    console.log(await parser.parse(res));
  } catch (error) {
    console.error(error);
  }
};

// Prompts the user to say anything and openAI will translate the language provided in the prompt - sends the response to promptFunc for AI answer.
const init = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "name",
        message: "What would you like translated?",
      },
    ])
    .then((inquirerResponse) => {
      promptFunc(inquirerResponse.name);
    });
};

init();
