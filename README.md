# Export Voiceflow project to Microsoft Bot Composer

This is a demonstration of converting a Voiceflow project into the Microsoft Bot Composer format.

## Setup

Create a Voiceflow project that has intent events and output steps following it (speak or text steps).
Export the Voiceflow project as a `.vf` file.

![Screen Shot 2023-01-26 at 5 18 36 PM](https://user-images.githubusercontent.com/5643574/214963509-9c5a9b33-d069-41af-9729-1117ac436a2c.png)

You can leave this file where convenient (`~/Desktop`, `~/Downloads`, `~/Documents`, etc.).

[Node.js](https://nodejs.org/en/) and [Yarn](https://classic.yarnpkg.com/en/docs/install) are required.

On the root level of this repository,

1. Run `yarn install` to install the dependencies
2. Run `yarn build` to compile the tool
3. Run `yarn start [PATH TO FILE]`, or `yarn start` to convert a `project.vf` file stored in this directory

`[PATH TO FILE]` is where the `.vf` file was saved earlier.
If the file was called `project.vf` was on my Desktop, it would be `yarn start ~/Desktop/project.vf`

The converter will create a `.lu` file for user inputs, and a `.lg` file for bot responses.
These files are packaged in the `.zip` file that is created for you to add to an existing Microsoft Bot Composer project.

The output `.zip` file has the same name as the input file (ex. `project.vf` -> `project.zip`).
