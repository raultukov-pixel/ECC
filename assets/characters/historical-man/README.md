# Ordinary historical man - rigged base character

Refined, rigged version of the supplied `ordinary_historical_man.glb` (kept in `reference/`).
Modest linen tunic, waist cord, loose trousers, sandals, short dark hair and short beard.
No armour, jewellery or fantasy elements. Colours follow the original preview.

## Files

| File | Purpose |
|------|---------|
| `historical_man_rigged.blend` | Master file (built with Blender 5.2 / `bpy` 5.2.3). Contains the character, Rigify rig, metarig and the original base model in a hidden collection |
| `historical_man_rigged.glb` / `.fbx` | Export of meshes + deform skeleton for other tools (no Rigify control rig) |
| `preview/` | Contact sheets: views, test poses, face |
| `build/` | Python scripts that regenerate everything: `python3 build/build_character.py <base.glb> <out_dir>` (needs `pip install bpy`) |

## What was changed versus the base model

- Rebuilt as clean continuous meshes: body skin (head, neck, torso, arms, hands with fingers, legs, feet), tunic with sleeves, trousers, sandals, waist cord, hair, beard, eyebrows, eyes.
- Natural proportions (about 1.76 m, around 7.6 heads), relaxed A-pose, face features redistributed to real facial proportions, eyelids, ears.
- Materials: procedural linen / cloth / skin (subsurface, lip tone), colours taken from the base model.
- Rig: Rigify human metarig fitted to the body, generated as `Rig_historical_man` (IK/FK arms and legs, spine, fingers, face with eyelids, brows, lips, jaw, eye targets). Metarig kept as `Metarig_historical_man` for regeneration.
- Skin weights: automatic weights on the body, then copied to clothing, hair, beard, eyebrows by nearest surface and smoothed (max 4 influences). Eyeballs are parented to the Rigify eye bones.

## Rig usage notes

- Limbs start in IK mode (`IK_FK` property on `upper_arm_parent.L/R`, `thigh_parent.L/R`: 0 = IK, 1 = FK).
- Eyelids are four controls per lid (`lid.T.L`, `.001`, `.002`, `.003`, same for `lid.B`); move all of them to blink.
- Rigify's generated UI script is stored in the .blend; enable the Rigify add-on and "Auto-run Python scripts" to get the control panel.

## Known limitations (be honest about what is not finished)

- No mouth cavity, teeth or tongue meshes (bones exist). Fine for closed-mouth acting, not ready for close-up dialogue.
- Face is stylised, with no blendshapes; facial weights are an automatic first pass and need weight painting for close-ups.
- Tunic is skinned, not simulated. In extreme poses (deep squat, high leg lifts) trousers or skin can poke through the short tunic hem; two tiny skin specks show at the back in rest pose.
- Hands: fingers deform acceptably but were only tested with open hands.
- The .blend was saved by Blender 5.2; older Blender versions cannot open it. Use the GLB/FBX or rerun `build/`.
- Not tested: walk/run cycles, retargeting, rendering at film quality (materials are procedural, no UV textures).
