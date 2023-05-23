import { BaseModels } from '@voiceflow/base-types';
import { JSONEntity } from '@voiceflow/common';
import { Luis, VoiceflowConstants } from '@voiceflow/voiceflow-types';
import { ComposerBuiltInEntities, ComposerUserInputEntity } from './types';
import { entityNameToComposerIntentName, isCustomType } from './utils';

export type EntitiesByIndex = ReadonlyMap<number, JSONEntity>;
export const getJsonEntityLength = (entity: Readonly<JSONEntity>): number => entity.endPos - entity.startPos;

export const SLOT_TYPE_DEFAULT_UTTERANCES: ReadonlyMap<string | VoiceflowConstants.SlotType, string[]> = new Map(
  VoiceflowConstants.SlotTypes[VoiceflowConstants.Language.EN].map((slotType) => [slotType.name, slotType.values])
);

const luisTypeForVoiceflowSlot = (slot: BaseModels.Slot): ComposerBuiltInEntities => {
  return Luis.Node.GENERAL_SLOT_TYPE_TO_LUIS.get(slot.type.value as VoiceflowConstants.SlotType);
};

export const voiceflowSlotToComposerEntity = (slot: BaseModels.Slot): ComposerUserInputEntity => {
  const entityName = entityNameToComposerIntentName(slot.name);

  if (isCustomType(slot.type.value)) {
    return {
      kind: 'list',
      name: entityName,
      values: slot.inputs.map((input) => {
        const [canonical, ...synonyms] = input.split(',');

        return {
          canonical: canonical.trim().toLowerCase(),
          synonyms: synonyms.map((synonym) => synonym.trim().toLowerCase()),
        };
      }),
    };
  }

  return {
    kind: 'builtin',
    name: entityName,
    type: luisTypeForVoiceflowSlot(slot),
  };
};
