# Adding a New Avatar Component

This guide will walk you through the process of adding a new avatar component to your project. Please follow the instructions carefully to ensure proper implementation.

## Pre-Export Instructions

Currently all the avatar models are created using readyplayer.me . And would recommend using that only until further updates.

**Assuming you are exporting from Blender:**

1. The dimensions of the human-sized model should be approximately - X(0.520m) Y(1.8m) Z(0.409) in T-Pose.
2. The model should have the following animations with the same name: `idle`, `walk`, `run`, and `jump`.
3. During the export process, check the "Y up" button from the transform property.
4. Export in the format glTF Embedded.

## Post-Export Instructions

1. Add the exported model to the `client/public/assets/avatars` folder.
2. Now, to create the avatar component, clone the `reference.jsx` file from the `Components/Avatars` folder.
3. Inside the `config/Avatar.ts` file add the configs for your avatar.
4. Rename the file and, using the comments inside the file as a guide, make the necessary changes to implement your new avatar component.

Congratulations! Your new avatar component is now ready for use.
