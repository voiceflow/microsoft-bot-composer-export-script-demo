import { BaseModels, BaseNode, Utils } from '@voiceflow/base-types';
import { VoiceflowModels } from '@voiceflow/voiceflow-types';
import fs from 'fs/promises';
import path from 'path';
import { getSteps } from './diagram';
import { SLOT_TYPE_DEFAULT_UTTERANCES, voiceflowSlotToComposerEntity } from './entity';
import { responseNameForIntent, voiceflowToRasaIntent } from './intent';
import { ComposerProjectContainer, ComposerUserInputIntent } from './types';
import { projectNameToComposerProjectName, sanitizeResourceName, slateToPlaintext } from './utils';
import { zipIntents } from './zip';

async function main() {
  // get first parameter from command line
  const [, , ...args] = process.argv;

  const readFilePath = args[0] || 'project.vf';
  const { dir: readFileDirectory, name: readFileName } = path.parse(readFilePath);

  console.log(`Reading ${readFileName}`);

  const content = JSON.parse(await fs.readFile(readFilePath, 'utf8')) as VoiceflowModels.VF;
  const diagrams = content.diagrams;
  const platformData = content.version.platformData;

  const intentMap: Map<string, BaseModels.Intent> = new Map(platformData.intents.map((intent: BaseModels.Intent) => [intent.key, intent] as const));

  const slotMap = new Map<string, BaseModels.Slot>(
    platformData.slots.map((slot: BaseModels.Slot) => {
      return [
        slot.key,
        {
          ...slot,
          name: sanitizeResourceName(slot.name),
        },
      ];
    })
  );

  const composerProject: ComposerProjectContainer = {
    name: projectNameToComposerProjectName(content.project.name),
    userInput: {
      intents: {},
      entities: {},
    },
    botResponses: { responses: {} },
  };

  for (const diagram of Object.values(diagrams)) {
    const steps = getSteps(diagram);
    const stepsArray = Array.from(steps.values());

    for (const [index, step] of stepsArray.entries()) {
      if (step.type === BaseNode.NodeType.INTENT && step.data?.intent) {
        const intent = intentMap.get(step.data.intent);
        if (!intent) continue;

        intent.name = sanitizeResourceName(intent.name);

        for (const slot of intent.slots.map((slot) => slotMap.get(slot.id))) {
          const defaultUtterances = SLOT_TYPE_DEFAULT_UTTERANCES.get(slot.type.value);
          if (defaultUtterances) {
            // This is a built-in slot, so we need to add in the default utterances
            slot.inputs.push(...defaultUtterances);
          }
        }

        let responses: string[] = [];

        // Get the next step, and check if it's a speak or text step
        const nextStep = stepsArray[index + 1];
        if (Utils.step.isText(nextStep)) {
          responses = nextStep.data.texts.map((dialog) => slateToPlaintext(dialog.content));
        } else if (Utils.step.isSpeak(nextStep)) {
          responses = nextStep.data.dialogs.map((dialog) => dialog.content);
        }

        const composerIntent: ComposerUserInputIntent = voiceflowToRasaIntent(intent, slotMap, responses);

        composerProject.botResponses.responses[responseNameForIntent(composerIntent)] = responses;

        if (composerIntent.name in composerProject.userInput.intents) {
          throw new RangeError(`Duplicate intent name: ${composerIntent.name}`);
        }

        composerProject.userInput.intents[composerIntent.name] = composerIntent;
      }
    }
  }

  // Entities
  for (const slot of slotMap.values()) {
    const composerEntity = voiceflowSlotToComposerEntity(slot);

    composerProject.userInput.entities[composerEntity.name] = composerEntity;
  }

  const exportFileName = `${readFileName}.zip`;
  const writePathName = path.join(readFileDirectory, exportFileName);

  await zipIntents(composerProject, writePathName);

  console.log(`Successfully exported project to ${exportFileName}`);
}

main();
