# lib import
if you want to import some lib,you can import what you like lib this way.
```javascript
lib.import("lib_name");
//basic use ways
lib.import("gamemaker");
//so you can import 'gamemaker' lib by this way
const gm = gamemaker.init();
const Game1 = new gm("plane");
//so you can use 'gamemaker' lib's any function
//All code for function libs is compiled at the very beginning and all imported libs are loaded first, no matter where you 'lib.import'.
//Customised javascript is basically handled from the top, with the exception here.
```