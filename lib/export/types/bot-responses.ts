/**
 * Key: response name (ex. IntroMessage)
 * Value: array of response strings
 */
export type ComposerBotResponse = Record<string, string[]>;

export type ComposerBotResponses = {
  responses: ComposerBotResponse;
};
