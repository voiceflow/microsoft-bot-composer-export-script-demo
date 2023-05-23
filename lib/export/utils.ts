import { BaseText } from '@voiceflow/base-types';
import { serializeToText } from '@voiceflow/slate-serializer/text';
import { VoiceflowConstants, VoiceflowUtils } from '@voiceflow/voiceflow-types';
import camelcase from 'camelcase';
import * as Slate from 'slate';
import { transliterate } from 'transliteration';

export const sanitizeResourceName = (name: string): string =>
  // Try our best to keep the sanitized name close to the original
  transliterate(name)
    .replaceAll(' ', '_')
    .replace(/[^_a-z\d-]/gi, '')
    .trim();

export const intentNameToComposerIntentName = (intentName: string): string => camelcase(intentName, { pascalCase: true });

export const entityNameToComposerIntentName = (entityName: string): string => entityName;

export const projectNameToComposerProjectName = (projectName: string): string => camelcase(projectName, { pascalCase: true });

const BUILT_IN_SLOTS: Set<string | VoiceflowConstants.SlotType> = new Set(Object.values(VoiceflowConstants.SlotType));

export const isCustomType = (slotType: string | VoiceflowConstants.SlotType): boolean => !BUILT_IN_SLOTS.has(slotType);

export type SanitizedPrompt = string | BaseText.SlateTextValue | undefined;

/** @description if contents of prompt is empty with trim */
export const isPromptEmpty = (prompt?: VoiceflowUtils.prompt.AnyPrompt | null): prompt is null | undefined => {
  if (VoiceflowUtils.prompt.isChatPrompt(prompt)) return !serializeToText(prompt.content, { encodeVariables: false }).trim();
  if (VoiceflowUtils.prompt.isVoicePrompt(prompt)) return !prompt.content?.trim();
  if (VoiceflowUtils.prompt.isIntentVoicePrompt(prompt)) return !prompt.text?.trim();

  return true;
};

export const slateToPlaintext = (content: Readonly<BaseText.SlateTextValue> = []): string =>
  content
    .map((n) => Slate.Node.string(n))
    .join('\n')
    .trim();
