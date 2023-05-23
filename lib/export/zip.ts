import fs from 'fs/promises';
import JSZip from 'jszip';
import path, { join } from 'path';

import { ComposerBotResponses, ComposerProjectContainer, ComposerUserInput, ComposerUserInputEntity } from './types';

const JSZIP_OPTIONS = {};

const userInputSerializer = (userInput: ComposerUserInput): string => {
  const result = ['> # Intent definitions', ''];

  for (const intent of Object.values(userInput.intents)) {
    result.push(`# ${intent.name}`, ...intent.utterances.map((utterance) => `- ${utterance}`), '');
  }

  const entitiesUsingPrebuilts = Object.values(userInput.entities).filter(
    (entity): entity is ComposerUserInputEntity & { kind: 'builtin' } => entity.kind === 'builtin'
  );
  const prebuilts = new Set(entitiesUsingPrebuilts.map((entity) => entity.type));

  if (prebuilts.size > 0) {
    result.push('> # Entity definitions', '');

    for (const entity of entitiesUsingPrebuilts) {
      result.push(`@ ml ${entity.name} ${entity.type}`, '');
    }

    result.push('> # PREBUILT Entity definitions', '');

    for (const entity of prebuilts) {
      result.push(`@ prebuilt ${entity}`, '');
    }
  }

  return result.join('\n');
};

const serializeBotResponses = (botResponses: ComposerBotResponses): string => {
  const result: string[] = [];

  for (const [responseName, responses] of Object.entries(botResponses.responses)) {
    if (responses.length === 0) {
      continue;
    }
    result.push(`# ${responseName}()`, ...responses.map((response) => `- ${response}`), '');
  }

  return result.join('\n');
};

export const zipIntents = async (project: ComposerProjectContainer, outputPath: string): Promise<void> => {
  const zip = JSZip();

  zip.file(`language-understanding/en-us/${project.name}.en-us.lu`, userInputSerializer(project.userInput), JSZIP_OPTIONS);
  zip.file(`language-generation/en-us/${project.name}.en-us.lg`, serializeBotResponses(project.botResponses), JSZIP_OPTIONS);

  const prefix = join(__dirname, '..', 'project_unzipped');

  await fs.rm(prefix, { recursive: true, force: true });

  await fs.rm(prefix, { recursive: true, force: true });
  await fs.mkdir(prefix, { recursive: true });

  for (const file of Object.values(zip.files)) {
    if (file.dir) {
      await fs.mkdir(join(prefix, file.name), { recursive: true });
    } else {
      await fs.mkdir(path.dirname(join(prefix, file.name)), { recursive: true });

      await fs.writeFile(join(prefix, file.name), await file.async('nodebuffer'));
    }
  }

  await fs.rm(outputPath, { force: true });
  await fs.writeFile(outputPath, await zip.generateAsync({ type: 'nodebuffer' }));
};
