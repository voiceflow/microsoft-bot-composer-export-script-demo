import { ComposerBotResponses } from './bot-responses';
import { ComposerUserInput } from './user-input';

export type ComposerProjectContainer = {
  name: string;
  userInput: ComposerUserInput;
  botResponses: ComposerBotResponses;
};

export * from './bot-responses';
export * from './user-input';
