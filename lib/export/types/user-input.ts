import { Luis, VoiceflowConstants } from '@voiceflow/voiceflow-types';

export type ComposerUserInputIntent = {
  name: string;
  utterances: string[];
};

/**
 * Key: intent name
 * Value: intent definition
 */
export type ComposerUserInputIntents = Record<string, ComposerUserInputIntent>;

export type ComposerBuiltInEntities = Luis.Node.BuiltInLuisSlotType;

export type ComposerUserInputEntity =
  | {
      /** A custom entity, defined with a list of values (and any synonyms for them) */
      kind: 'list';
      values: Array<{ canonical: string; synonyms: string[] }>;
      name: string;
    }
  | {
      kind: 'builtin';
      /** The builtin type to use for it. */
      type: ComposerBuiltInEntities;
      name: string;
    };

/**
 * Key: entity name
 * Value: entity definition
 */
export type ComposerUserInputEntities = Record<string, ComposerUserInputEntity>;

export type ComposerUserInput = {
  intents: ComposerUserInputIntents;
  entities: ComposerUserInputEntities;
};
