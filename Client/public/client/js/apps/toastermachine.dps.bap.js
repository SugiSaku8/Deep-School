/*
This is ToasterMachine functions system base,
acturually it is not a full app,
so you should show user by menu.ap2.js
*/
export const appMeta = {
  name: "tmbase",
  title: "ToasterMachine",
  icon: "re/ico/tm.png",
};
import { GeminiProcessor, CoachingSession, ChatHistoryManager } from "../chat/tm/model.mjs";
/**
 * Create a new GeminiProcessor instance.
 * @returns {GeminiProcessor} The GeminiProcessor instance.
 */
export default function GeminiIninter(){
    const gemini_inited = new GeminiProcessor();
    return gemini_inited;
}
/**
 * Creates a new CoachingSession instance and wraps it in an object
 * with two methods: start and handle.
 * @param {GeminiProcessor} gemini - The GeminiProcessor instance to use for the CoachingSession.
 * @returns {Object} An object with two methods: start and handle.
 * The start method takes a message as an argument and returns the first reply from the model.
 * The handle method takes a message as an argument and returns the reply from the model.
 */

export function ssession(gemini){
    const session = new CoachingSession(gemini);
    return {
         async start(msg){
        /**
         * Start a new CoachingSession with the given message.
         * @param {string} msg - The message to start the CoachingSession with.
         * @returns {Promise<string>} The first reply from the model.
***/ 
           const firstReply = await session.startSession(msg);
            return firstReply;
        },

        /**
         * Handles a message from the user and returns the response from the model.
         * @param {string} msg - The message from the user to handle.
         * @returns {Promise<string>} The response from the model.
**/
        async handle(msg){
            const reply = await session.handleMessage(msg);
            return reply;
        }
    }
}

/**
 * ToasterMachine Base Application initializer.
 * This function is called by Deep School Shell when this application is initialized.
 * It logs a message to the console to indicate that the initialization process has started.
 * @param {DeepSchoolShell} shell - The Deep School Shell instance.
 */
function appInit(shell){
      shell.log({from: 'dp.bapp.tm.out', message: 'tmbase: init process started', level: 'info'});
      shell.log({from: 'dp.bapp.tm.out', message: 'tmbase: waiting use tm', level: 'info'});

 }