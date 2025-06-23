// To parse this data:
//
//   const Convert = require("./file");
//
//   const lDtk = Convert.toLDtk(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
function toLDtk(json) {
  return cast(JSON.parse(json), r("LDtk"));
}

function lDtkToJson(value) {
  return JSON.stringify(uncast(value, r("LDtk")), null, 2);
}

function invalidValue(typ, val, key, parent = "") {
  const prettyTyp = prettyTypeName(typ);
  const parentText = parent ? ` on ${parent}` : "";
  const keyText = key ? ` for key "${key}"` : "";
  throw Error(
    `Invalid value${keyText}${parentText}. Expected ${prettyTyp} but got ${JSON.stringify(
      val
    )}`
  );
}

function prettyTypeName(typ) {
  if (Array.isArray(typ)) {
    if (typ.length === 2 && typ[0] === undefined) {
      return `an optional ${prettyTypeName(typ[1])}`;
    } else {
      return `one of [${typ
        .map((a) => {
          return prettyTypeName(a);
        })
        .join(", ")}]`;
    }
  } else if (typeof typ === "object" && typ.literal !== undefined) {
    return typ.literal;
  } else {
    return typeof typ;
  }
}

function jsonToJSProps(typ) {
  if (typ.jsonToJS === undefined) {
    const map = {};
    typ.props.forEach((p) => (map[p.json] = { key: p.js, typ: p.typ }));
    typ.jsonToJS = map;
  }
  return typ.jsonToJS;
}

function jsToJSONProps(typ) {
  if (typ.jsToJSON === undefined) {
    const map = {};
    typ.props.forEach((p) => (map[p.js] = { key: p.json, typ: p.typ }));
    typ.jsToJSON = map;
  }
  return typ.jsToJSON;
}

function transform(val, typ, getProps, key = "", parent = "") {
  function transformPrimitive(typ, val) {
    if (typeof typ === typeof val) return val;
    return invalidValue(typ, val, key, parent);
  }

  function transformUnion(typs, val) {
    // val must validate against one typ in typs
    const l = typs.length;
    for (let i = 0; i < l; i++) {
      const typ = typs[i];
      try {
        return transform(val, typ, getProps);
      } catch (_) {}
    }
    return invalidValue(typs, val, key, parent);
  }

  function transformEnum(cases, val) {
    if (cases.indexOf(val) !== -1) return val;
    return invalidValue(
      cases.map((a) => {
        return l(a);
      }),
      val,
      key,
      parent
    );
  }

  function transformArray(typ, val) {
    // val must be an array with no invalid elements
    if (!Array.isArray(val)) return invalidValue(l("array"), val, key, parent);
    return val.map((el) => transform(el, typ, getProps));
  }

  function transformDate(val) {
    if (val === null) {
      return null;
    }
    const d = new Date(val);
    if (isNaN(d.valueOf())) {
      return invalidValue(l("Date"), val, key, parent);
    }
    return d;
  }

  function transformObject(props, additional, val) {
    if (val === null || typeof val !== "object" || Array.isArray(val)) {
      return invalidValue(l(ref || "object"), val, key, parent);
    }
    const result = {};
    Object.getOwnPropertyNames(props).forEach((key) => {
      const prop = props[key];
      const v = Object.prototype.hasOwnProperty.call(val, key)
        ? val[key]
        : undefined;
      result[prop.key] = transform(v, prop.typ, getProps, key, ref);
    });
    Object.getOwnPropertyNames(val).forEach((key) => {
      if (!Object.prototype.hasOwnProperty.call(props, key)) {
        result[key] = transform(val[key], additional, getProps, key, ref);
      }
    });
    return result;
  }

  if (typ === "any") return val;
  if (typ === null) {
    if (val === null) return val;
    return invalidValue(typ, val, key, parent);
  }
  if (typ === false) return invalidValue(typ, val, key, parent);
  let ref = undefined;
  while (typeof typ === "object" && typ.ref !== undefined) {
    ref = typ.ref;
    typ = typeMap[typ.ref];
  }
  if (Array.isArray(typ)) return transformEnum(typ, val);
  if (typeof typ === "object") {
    return typ.hasOwnProperty("unionMembers")
      ? transformUnion(typ.unionMembers, val)
      : typ.hasOwnProperty("arrayItems")
      ? transformArray(typ.arrayItems, val)
      : typ.hasOwnProperty("props")
      ? transformObject(getProps(typ), typ.additional, val)
      : invalidValue(typ, val, key, parent);
  }
  // Numbers can be parsed by Date but shouldn't be.
  if (typ === Date && typeof val !== "number") return transformDate(val);
  return transformPrimitive(typ, val);
}

function cast(val, typ) {
  return transform(val, typ, jsonToJSProps);
}

function uncast(val, typ) {
  return transform(val, typ, jsToJSONProps);
}

function l(typ) {
  return { literal: typ };
}

function a(typ) {
  return { arrayItems: typ };
}

function u(...typs) {
  return { unionMembers: typs };
}

function o(props, additional) {
  return { props, additional };
}

function m(additional) {
  return { props: [], additional };
}

function r(name) {
  return { ref: name };
}

const typeMap = {
  LDtk: o(
    [
      { json: "description", js: "description", typ: "" },
      { json: "title", js: "title", typ: "" },
      { json: "$schema", js: "$schema", typ: "" },
      { json: "$ref", js: "$ref", typ: "" },
      { json: "version", js: "version", typ: "" },
      { json: "LdtkJsonRoot", js: "LdtkJsonRoot", typ: r("LdtkJsonRoot") },
      { json: "otherTypes", js: "otherTypes", typ: r("OtherTypes") },
    ],
    false
  ),
  LdtkJsonRoot: o(
    [
      { json: "description", js: "description", typ: "" },
      { json: "title", js: "title", typ: "" },
      { json: "required", js: "required", typ: a("") },
      {
        json: "properties",
        js: "properties",
        typ: r("LdtkJsonRootProperties"),
      },
      { json: "type", js: "type", typ: a(r("FORCEDREFSType")) },
    ],
    false
  ),
  LdtkJsonRootProperties: o(
    [
      { json: "backupLimit", js: "backupLimit", typ: r("AppBuildid") },
      {
        json: "defaultEntityWidth",
        js: "defaultEntityWidth",
        typ: r("AppBuildid"),
      },
      { json: "backupOnSave", js: "backupOnSave", typ: r("AppBuildid") },
      { json: "worldGridWidth", js: "worldGridWidth", typ: r("AppBuildid") },
      { json: "iid", js: "iid", typ: r("AppBuildid") },
      {
        json: "defaultLevelBgColor",
        js: "defaultLevelBgColor",
        typ: r("AppBuildid"),
      },
      { json: "bgColor", js: "bgColor", typ: r("AppBuildid") },
      { json: "worlds", js: "worlds", typ: r("CustomCommands") },
      { json: "toc", js: "toc", typ: r("CustomCommands") },
      { json: "nextUid", js: "nextUid", typ: r("AppBuildid") },
      {
        json: "imageExportMode",
        js: "imageExportMode",
        typ: r("IdentifierStyle"),
      },
      {
        json: "identifierStyle",
        js: "identifierStyle",
        typ: r("IdentifierStyle"),
      },
      { json: "defaultPivotY", js: "defaultPivotY", typ: r("AppBuildid") },
      { json: "dummyWorldIid", js: "dummyWorldIid", typ: r("AppBuildid") },
      {
        json: "customCommands",
        js: "customCommands",
        typ: r("CustomCommands"),
      },
      { json: "worldGridHeight", js: "worldGridHeight", typ: r("AppBuildid") },
      { json: "appBuildId", js: "appBuildId", typ: r("AppBuildid") },
      { json: "defaultGridSize", js: "defaultGridSize", typ: r("AppBuildid") },
      { json: "worldLayout", js: "worldLayout", typ: r("WorldLayout") },
      { json: "flags", js: "flags", typ: r("Flags") },
      {
        json: "levelNamePattern",
        js: "levelNamePattern",
        typ: r("AppBuildid"),
      },
      { json: "exportPng", js: "exportPng", typ: r("AppBuildid") },
      {
        json: "defaultLevelWidth",
        js: "defaultLevelWidth",
        typ: r("AppBuildid"),
      },
      { json: "pngFilePattern", js: "pngFilePattern", typ: r("AppBuildid") },
      { json: "__FORCED_REFS", js: "__FORCED_REFS", typ: r("ForcedRefs") },
      { json: "exportTiled", js: "exportTiled", typ: r("AppBuildid") },
      { json: "defs", js: "defs", typ: r("Defs") },
      { json: "levels", js: "levels", typ: r("CustomCommands") },
      { json: "jsonVersion", js: "jsonVersion", typ: r("AppBuildid") },
      {
        json: "defaultEntityHeight",
        js: "defaultEntityHeight",
        typ: r("AppBuildid"),
      },
      { json: "defaultPivotX", js: "defaultPivotX", typ: r("AppBuildid") },
      {
        json: "defaultLevelHeight",
        js: "defaultLevelHeight",
        typ: r("AppBuildid"),
      },
      {
        json: "simplifiedExport",
        js: "simplifiedExport",
        typ: r("AppBuildid"),
      },
      { json: "externalLevels", js: "externalLevels", typ: r("AppBuildid") },
      { json: "tutorialDesc", js: "tutorialDesc", typ: r("AppBuildid") },
      { json: "minifyJson", js: "minifyJson", typ: r("AppBuildid") },
      { json: "exportLevelBg", js: "exportLevelBg", typ: r("AppBuildid") },
      { json: "backupRelPath", js: "backupRelPath", typ: r("AppBuildid") },
    ],
    false
  ),
  ForcedRefs: o(
    [
      { json: "description", js: "description", typ: "" },
      { json: "properties", js: "properties", typ: m(r("ItemsValue")) },
      { json: "type", js: "type", typ: a(r("FORCEDREFSType")) },
    ],
    false
  ),
  ItemsValue: o([{ json: "$ref", js: "$ref", typ: "" }], false),
  AppBuildid: o(
    [
      { json: "description", js: "description", typ: "" },
      { json: "type", js: "type", typ: a(r("FORCEDREFSType")) },
    ],
    false
  ),
  CustomCommands: o(
    [
      { json: "description", js: "description", typ: "" },
      { json: "items", js: "items", typ: r("ItemsValue") },
      { json: "type", js: "type", typ: a(r("CustomCommandsType")) },
    ],
    false
  ),
  Defs: o(
    [
      { json: "description", js: "description", typ: "" },
      { json: "$ref", js: "$ref", typ: "" },
    ],
    false
  ),
  Flags: o(
    [
      { json: "description", js: "description", typ: "" },
      { json: "items", js: "items", typ: r("FlagsItems") },
      { json: "type", js: "type", typ: a(r("CustomCommandsType")) },
    ],
    false
  ),
  FlagsItems: o([{ json: "enum", js: "enum", typ: a("") }], false),
  IdentifierStyle: o(
    [
      { json: "description", js: "description", typ: "" },
      { json: "enum", js: "enum", typ: a("") },
    ],
    false
  ),
  WorldLayout: o(
    [
      { json: "description", js: "description", typ: "" },
      { json: "enum", js: "enum", typ: a(u(null, "")) },
    ],
    false
  ),
  OtherTypes: o(
    [
      { json: "TilesetRect", js: "TilesetRect", typ: r("TilesetRect") },
      { json: "FieldInstance", js: "FieldInstance", typ: r("FieldInstance") },
      {
        json: "EntityInstance",
        js: "EntityInstance",
        typ: r("EntityInstance"),
      },
      { json: "Definitions", js: "Definitions", typ: r("Definitions") },
      { json: "EnumTagValue", js: "EnumTagValue", typ: r("EnumTagValue") },
      { json: "AutoRuleDef", js: "AutoRuleDef", typ: r("AutoRuleDef") },
      { json: "FieldDef", js: "FieldDef", typ: r("FieldDef") },
      { json: "CustomCommand", js: "CustomCommand", typ: r("CustomCommand") },
      { json: "EntityDef", js: "EntityDef", typ: r("EntityDef") },
      {
        json: "AutoLayerRuleGroup",
        js: "AutoLayerRuleGroup",
        typ: r("AutoLayerRuleGroup"),
      },
      {
        json: "IntGridValueGroupDef",
        js: "IntGridValueGroupDef",
        typ: r("IntGridValueGroupDef"),
      },
      {
        json: "IntGridValueInstance",
        js: "IntGridValueInstance",
        typ: r("IntGridValueInstance"),
      },
      {
        json: "TocInstanceData",
        js: "TocInstanceData",
        typ: r("TocInstanceData"),
      },
      {
        json: "NeighbourLevel",
        js: "NeighbourLevel",
        typ: r("NeighbourLevel"),
      },
      { json: "LayerInstance", js: "LayerInstance", typ: r("LayerInstance") },
      { json: "World", js: "World", typ: r("World") },
      {
        json: "EntityReferenceInfos",
        js: "EntityReferenceInfos",
        typ: r("EntityReferenceInfos"),
      },
      {
        json: "TileCustomMetadata",
        js: "TileCustomMetadata",
        typ: r("TileCustomMetadata"),
      },
      { json: "TilesetDef", js: "TilesetDef", typ: r("TilesetDef") },
      { json: "EnumDefValues", js: "EnumDefValues", typ: r("EnumDefValues") },
      { json: "Tile", js: "Tile", typ: r("Tile") },
      { json: "LayerDef", js: "LayerDef", typ: r("LayerDef") },
      {
        json: "LevelBgPosInfos",
        js: "LevelBgPosInfos",
        typ: r("LevelBgPosInfos"),
      },
      { json: "Level", js: "Level", typ: r("Level") },
      {
        json: "TableOfContentEntry",
        js: "TableOfContentEntry",
        typ: r("TableOfContentEntry"),
      },
      { json: "EnumDef", js: "EnumDef", typ: r("EnumDef") },
      { json: "GridPoint", js: "GridPoint", typ: r("GridPoint") },
      {
        json: "IntGridValueDef",
        js: "IntGridValueDef",
        typ: r("IntGridValueDef"),
      },
    ],
    false
  ),
  AutoLayerRuleGroup: o(
    [
      { json: "title", js: "title", typ: "" },
      { json: "required", js: "required", typ: a("") },
      { json: "additionalProperties", js: "additionalProperties", typ: true },
      {
        json: "properties",
        js: "properties",
        typ: r("AutoLayerRuleGroupProperties"),
      },
      { json: "type", js: "type", typ: a(r("FORCEDREFSType")) },
    ],
    false
  ),
  AutoLayerRuleGroupProperties: o(
    [
      { json: "name", js: "name", typ: r("AppBuildid") },
      { json: "collapsed", js: "collapsed", typ: r("AppBuildid") },
      {
        json: "biomeRequirementMode",
        js: "biomeRequirementMode",
        typ: r("AppBuildid"),
      },
      { json: "color", js: "color", typ: r("AppBuildid") },
      { json: "isOptional", js: "isOptional", typ: r("AppBuildid") },
      { json: "icon", js: "icon", typ: r("Icon") },
      { json: "usesWizard", js: "usesWizard", typ: r("AppBuildid") },
      { json: "uid", js: "uid", typ: r("AppBuildid") },
      {
        json: "requiredBiomeValues",
        js: "requiredBiomeValues",
        typ: r("RequiredBiomeValues"),
      },
      { json: "active", js: "active", typ: r("AppBuildid") },
      { json: "rules", js: "rules", typ: r("CustomCommands") },
    ],
    false
  ),
  Icon: o(
    [
      { json: "description", js: "description", typ: "" },
      { json: "oneOf", js: "oneOf", typ: a(r("OneOf")) },
    ],
    false
  ),
  OneOf: o(
    [
      { json: "type", js: "type", typ: u(undefined, a(r("FORCEDREFSType"))) },
      { json: "$ref", js: "$ref", typ: u(undefined, "") },
    ],
    false
  ),
  RequiredBiomeValues: o(
    [
      { json: "description", js: "description", typ: "" },
      { json: "items", js: "items", typ: r("RequiredBiomeValuesItems") },
      { json: "type", js: "type", typ: a(r("CustomCommandsType")) },
    ],
    false
  ),
  RequiredBiomeValuesItems: o(
    [{ json: "type", js: "type", typ: a(r("FORCEDREFSType")) }],
    false
  ),
  AutoRuleDef: o(
    [
      { json: "description", js: "description", typ: "" },
      { json: "title", js: "title", typ: "" },
      { json: "required", js: "required", typ: a("") },
      { json: "additionalProperties", js: "additionalProperties", typ: true },
      { json: "properties", js: "properties", typ: r("AutoRuleDefProperties") },
      { json: "type", js: "type", typ: a(r("FORCEDREFSType")) },
    ],
    false
  ),
  AutoRuleDefProperties: o(
    [
      { json: "flipX", js: "flipX", typ: r("AppBuildid") },
      { json: "pivotX", js: "pivotX", typ: r("AppBuildid") },
      { json: "perlinActive", js: "perlinActive", typ: r("AppBuildid") },
      { json: "tileRectsIds", js: "tileRectsIds", typ: r("TileRectsIds") },
      { json: "perlinScale", js: "perlinScale", typ: r("AppBuildid") },
      {
        json: "outOfBoundsValue",
        js: "outOfBoundsValue",
        typ: r("AppBuildid"),
      },
      { json: "pattern", js: "pattern", typ: r("RequiredBiomeValues") },
      { json: "tileRandomXMin", js: "tileRandomXMin", typ: r("AppBuildid") },
      { json: "checker", js: "checker", typ: r("IdentifierStyle") },
      { json: "perlinOctaves", js: "perlinOctaves", typ: r("AppBuildid") },
      { json: "tileIds", js: "tileIds", typ: r("RequiredBiomeValues") },
      { json: "alpha", js: "alpha", typ: r("AppBuildid") },
      { json: "tileXOffset", js: "tileXOffset", typ: r("AppBuildid") },
      { json: "invalidated", js: "invalidated", typ: r("AppBuildid") },
      { json: "xModulo", js: "xModulo", typ: r("AppBuildid") },
      { json: "size", js: "size", typ: r("AppBuildid") },
      { json: "chance", js: "chance", typ: r("AppBuildid") },
      { json: "breakOnMatch", js: "breakOnMatch", typ: r("AppBuildid") },
      { json: "tileYOffset", js: "tileYOffset", typ: r("AppBuildid") },
      { json: "uid", js: "uid", typ: r("AppBuildid") },
      { json: "perlinSeed", js: "perlinSeed", typ: r("AppBuildid") },
      { json: "yOffset", js: "yOffset", typ: r("AppBuildid") },
      { json: "tileRandomYMax", js: "tileRandomYMax", typ: r("AppBuildid") },
      { json: "tileRandomYMin", js: "tileRandomYMin", typ: r("AppBuildid") },
      { json: "tileMode", js: "tileMode", typ: r("IdentifierStyle") },
      { json: "flipY", js: "flipY", typ: r("AppBuildid") },
      { json: "tileRandomXMax", js: "tileRandomXMax", typ: r("AppBuildid") },
      { json: "pivotY", js: "pivotY", typ: r("AppBuildid") },
      { json: "yModulo", js: "yModulo", typ: r("AppBuildid") },
      { json: "active", js: "active", typ: r("AppBuildid") },
      { json: "xOffset", js: "xOffset", typ: r("AppBuildid") },
    ],
    false
  ),
  TileRectsIds: o(
    [
      { json: "description", js: "description", typ: "" },
      { json: "items", js: "items", typ: r("TileRectsIdsItems") },
      { json: "type", js: "type", typ: a(r("CustomCommandsType")) },
    ],
    false
  ),
  TileRectsIdsItems: o(
    [
      { json: "items", js: "items", typ: r("RequiredBiomeValuesItems") },
      { json: "type", js: "type", typ: a(r("CustomCommandsType")) },
    ],
    false
  ),
  CustomCommand: o(
    [
      { json: "title", js: "title", typ: "" },
      { json: "required", js: "required", typ: a("") },
      { json: "additionalProperties", js: "additionalProperties", typ: true },
      {
        json: "properties",
        js: "properties",
        typ: r("CustomCommandProperties"),
      },
      { json: "type", js: "type", typ: a(r("FORCEDREFSType")) },
    ],
    false
  ),
  CustomCommandProperties: o(
    [
      { json: "when", js: "when", typ: r("IdentifierStyle") },
      { json: "command", js: "command", typ: r("AppBuildid") },
    ],
    false
  ),
  Definitions: o(
    [
      { json: "description", js: "description", typ: "" },
      { json: "title", js: "title", typ: "" },
      { json: "required", js: "required", typ: a("") },
      { json: "additionalProperties", js: "additionalProperties", typ: true },
      { json: "properties", js: "properties", typ: r("DefinitionsProperties") },
      { json: "type", js: "type", typ: a(r("FORCEDREFSType")) },
    ],
    false
  ),
  DefinitionsProperties: o(
    [
      { json: "tilesets", js: "tilesets", typ: r("CustomCommands") },
      { json: "layers", js: "layers", typ: r("CustomCommands") },
      { json: "levelFields", js: "levelFields", typ: r("CustomCommands") },
      { json: "enums", js: "enums", typ: r("CustomCommands") },
      { json: "entities", js: "entities", typ: r("CustomCommands") },
      { json: "externalEnums", js: "externalEnums", typ: r("CustomCommands") },
    ],
    false
  ),
  EntityDef: o(
    [
      { json: "title", js: "title", typ: "" },
      { json: "required", js: "required", typ: a("") },
      { json: "additionalProperties", js: "additionalProperties", typ: true },
      { json: "properties", js: "properties", typ: r("EntityDefProperties") },
      { json: "type", js: "type", typ: a(r("FORCEDREFSType")) },
    ],
    false
  ),
  EntityDefProperties: o(
    [
      { json: "tileId", js: "tileId", typ: r("AppBuildid") },
      { json: "showName", js: "showName", typ: r("AppBuildid") },
      { json: "tilesetId", js: "tilesetId", typ: r("AppBuildid") },
      { json: "maxHeight", js: "maxHeight", typ: r("AppBuildid") },
      { json: "limitScope", js: "limitScope", typ: r("IdentifierStyle") },
      { json: "pivotX", js: "pivotX", typ: r("AppBuildid") },
      { json: "maxCount", js: "maxCount", typ: r("AppBuildid") },
      {
        json: "allowOutOfBounds",
        js: "allowOutOfBounds",
        typ: r("AppBuildid"),
      },
      { json: "hollow", js: "hollow", typ: r("AppBuildid") },
      { json: "minHeight", js: "minHeight", typ: r("AppBuildid") },
      { json: "keepAspectRatio", js: "keepAspectRatio", typ: r("AppBuildid") },
      { json: "color", js: "color", typ: r("AppBuildid") },
      { json: "minWidth", js: "minWidth", typ: r("AppBuildid") },
      { json: "tileRect", js: "tileRect", typ: r("Icon") },
      { json: "doc", js: "doc", typ: r("AppBuildid") },
      { json: "fieldDefs", js: "fieldDefs", typ: r("CustomCommands") },
      {
        json: "tileRenderMode",
        js: "tileRenderMode",
        typ: r("IdentifierStyle"),
      },
      { json: "limitBehavior", js: "limitBehavior", typ: r("IdentifierStyle") },
      { json: "tileOpacity", js: "tileOpacity", typ: r("AppBuildid") },
      {
        json: "nineSliceBorders",
        js: "nineSliceBorders",
        typ: r("RequiredBiomeValues"),
      },
      { json: "resizableX", js: "resizableX", typ: r("AppBuildid") },
      { json: "uiTileRect", js: "uiTileRect", typ: r("Icon") },
      { json: "uid", js: "uid", typ: r("AppBuildid") },
      { json: "lineOpacity", js: "lineOpacity", typ: r("AppBuildid") },
      { json: "maxWidth", js: "maxWidth", typ: r("AppBuildid") },
      { json: "resizableY", js: "resizableY", typ: r("AppBuildid") },
      { json: "exportToToc", js: "exportToToc", typ: r("AppBuildid") },
      { json: "fillOpacity", js: "fillOpacity", typ: r("AppBuildid") },
      { json: "height", js: "height", typ: r("AppBuildid") },
      { json: "identifier", js: "identifier", typ: r("AppBuildid") },
      { json: "pivotY", js: "pivotY", typ: r("AppBuildid") },
      { json: "renderMode", js: "renderMode", typ: r("IdentifierStyle") },
      { json: "tags", js: "tags", typ: r("RequiredBiomeValues") },
      { json: "width", js: "width", typ: r("AppBuildid") },
    ],
    false
  ),
  EntityInstance: o(
    [
      { json: "title", js: "title", typ: "" },
      { json: "required", js: "required", typ: a("") },
      { json: "additionalProperties", js: "additionalProperties", typ: true },
      {
        json: "properties",
        js: "properties",
        typ: r("EntityInstanceProperties"),
      },
      { json: "type", js: "type", typ: a(r("FORCEDREFSType")) },
    ],
    false
  ),
  EntityInstanceProperties: o(
    [
      { json: "iid", js: "iid", typ: r("AppBuildid") },
      { json: "defUid", js: "defUid", typ: r("AppBuildid") },
      { json: "__identifier", js: "__identifier", typ: r("AppBuildid") },
      { json: "__tile", js: "__tile", typ: r("Icon") },
      { json: "px", js: "px", typ: r("RequiredBiomeValues") },
      { json: "__worldX", js: "__worldX", typ: r("AppBuildid") },
      { json: "__worldY", js: "__worldY", typ: r("AppBuildid") },
      { json: "__smartColor", js: "__smartColor", typ: r("AppBuildid") },
      { json: "__grid", js: "__grid", typ: r("RequiredBiomeValues") },
      { json: "__pivot", js: "__pivot", typ: r("RequiredBiomeValues") },
      {
        json: "fieldInstances",
        js: "fieldInstances",
        typ: r("CustomCommands"),
      },
      { json: "height", js: "height", typ: r("AppBuildid") },
      { json: "__tags", js: "__tags", typ: r("RequiredBiomeValues") },
      { json: "width", js: "width", typ: r("AppBuildid") },
    ],
    false
  ),
  EntityReferenceInfos: o(
    [
      { json: "description", js: "description", typ: "" },
      { json: "title", js: "title", typ: "" },
      { json: "required", js: "required", typ: a("") },
      { json: "additionalProperties", js: "additionalProperties", typ: true },
      {
        json: "properties",
        js: "properties",
        typ: r("EntityReferenceInfosProperties"),
      },
      { json: "type", js: "type", typ: a(r("FORCEDREFSType")) },
    ],
    false
  ),
  EntityReferenceInfosProperties: o(
    [
      { json: "worldIid", js: "worldIid", typ: r("AppBuildid") },
      { json: "entityIid", js: "entityIid", typ: r("AppBuildid") },
      { json: "layerIid", js: "layerIid", typ: r("AppBuildid") },
      { json: "levelIid", js: "levelIid", typ: r("AppBuildid") },
    ],
    false
  ),
  EnumDef: o(
    [
      { json: "title", js: "title", typ: "" },
      { json: "required", js: "required", typ: a("") },
      { json: "additionalProperties", js: "additionalProperties", typ: true },
      { json: "properties", js: "properties", typ: r("EnumDefProperties") },
      { json: "type", js: "type", typ: a(r("FORCEDREFSType")) },
    ],
    false
  ),
  EnumDefProperties: o(
    [
      {
        json: "externalFileChecksum",
        js: "externalFileChecksum",
        typ: r("AppBuildid"),
      },
      { json: "externalRelPath", js: "externalRelPath", typ: r("AppBuildid") },
      { json: "uid", js: "uid", typ: r("AppBuildid") },
      { json: "values", js: "values", typ: r("CustomCommands") },
      { json: "iconTilesetUid", js: "iconTilesetUid", typ: r("AppBuildid") },
      { json: "identifier", js: "identifier", typ: r("AppBuildid") },
      { json: "tags", js: "tags", typ: r("RequiredBiomeValues") },
    ],
    false
  ),
  EnumDefValues: o(
    [
      { json: "title", js: "title", typ: "" },
      { json: "required", js: "required", typ: a("") },
      { json: "additionalProperties", js: "additionalProperties", typ: true },
      {
        json: "properties",
        js: "properties",
        typ: r("EnumDefValuesProperties"),
      },
      { json: "type", js: "type", typ: a(r("FORCEDREFSType")) },
    ],
    false
  ),
  EnumDefValuesProperties: o(
    [
      { json: "tileId", js: "tileId", typ: r("AppBuildid") },
      { json: "color", js: "color", typ: r("AppBuildid") },
      { json: "tileRect", js: "tileRect", typ: r("Icon") },
      { json: "id", js: "id", typ: r("AppBuildid") },
      {
        json: "__tileSrcRect",
        js: "__tileSrcRect",
        typ: r("RequiredBiomeValues"),
      },
    ],
    false
  ),
  EnumTagValue: o(
    [
      { json: "description", js: "description", typ: "" },
      { json: "title", js: "title", typ: "" },
      { json: "required", js: "required", typ: a("") },
      { json: "additionalProperties", js: "additionalProperties", typ: true },
      {
        json: "properties",
        js: "properties",
        typ: r("EnumTagValueProperties"),
      },
      { json: "type", js: "type", typ: a(r("FORCEDREFSType")) },
    ],
    false
  ),
  EnumTagValueProperties: o(
    [
      { json: "tileIds", js: "tileIds", typ: r("RequiredBiomeValues") },
      { json: "enumValueId", js: "enumValueId", typ: r("AppBuildid") },
    ],
    false
  ),
  FieldDef: o(
    [
      { json: "description", js: "description", typ: "" },
      { json: "title", js: "title", typ: "" },
      { json: "required", js: "required", typ: a("") },
      { json: "additionalProperties", js: "additionalProperties", typ: true },
      { json: "properties", js: "properties", typ: r("FieldDefProperties") },
      { json: "type", js: "type", typ: a(r("FORCEDREFSType")) },
    ],
    false
  ),
  FieldDefProperties: o(
    [
      {
        json: "acceptFileTypes",
        js: "acceptFileTypes",
        typ: r("RequiredBiomeValues"),
      },
      {
        json: "editorDisplayScale",
        js: "editorDisplayScale",
        typ: r("AppBuildid"),
      },
      { json: "searchable", js: "searchable", typ: r("AppBuildid") },
      {
        json: "useForSmartColor",
        js: "useForSmartColor",
        typ: r("AppBuildid"),
      },
      {
        json: "editorShowInWorld",
        js: "editorShowInWorld",
        typ: r("AppBuildid"),
      },
      { json: "allowedRefs", js: "allowedRefs", typ: r("IdentifierStyle") },
      {
        json: "editorAlwaysShow",
        js: "editorAlwaysShow",
        typ: r("AppBuildid"),
      },
      { json: "arrayMinLength", js: "arrayMinLength", typ: r("AppBuildid") },
      {
        json: "editorTextSuffix",
        js: "editorTextSuffix",
        typ: r("AppBuildid"),
      },
      { json: "min", js: "min", typ: r("AppBuildid") },
      { json: "__type", js: "__type", typ: r("AppBuildid") },
      {
        json: "editorDisplayMode",
        js: "editorDisplayMode",
        typ: r("IdentifierStyle"),
      },
      {
        json: "editorDisplayColor",
        js: "editorDisplayColor",
        typ: r("AppBuildid"),
      },
      { json: "canBeNull", js: "canBeNull", typ: r("AppBuildid") },
      { json: "autoChainRef", js: "autoChainRef", typ: r("AppBuildid") },
      { json: "doc", js: "doc", typ: r("AppBuildid") },
      {
        json: "allowedRefsEntityUid",
        js: "allowedRefsEntityUid",
        typ: r("AppBuildid"),
      },
      { json: "tilesetUid", js: "tilesetUid", typ: r("AppBuildid") },
      {
        json: "allowedRefTags",
        js: "allowedRefTags",
        typ: r("RequiredBiomeValues"),
      },
      { json: "symmetricalRef", js: "symmetricalRef", typ: r("AppBuildid") },
      { json: "uid", js: "uid", typ: r("AppBuildid") },
      {
        json: "editorTextPrefix",
        js: "editorTextPrefix",
        typ: r("AppBuildid"),
      },
      { json: "isArray", js: "isArray", typ: r("AppBuildid") },
      { json: "exportToToc", js: "exportToToc", typ: r("AppBuildid") },
      {
        json: "editorDisplayPos",
        js: "editorDisplayPos",
        typ: r("IdentifierStyle"),
      },
      {
        json: "textLanguageMode",
        js: "textLanguageMode",
        typ: r("WorldLayout"),
      },
      { json: "max", js: "max", typ: r("AppBuildid") },
      {
        json: "allowOutOfLevelRef",
        js: "allowOutOfLevelRef",
        typ: r("AppBuildid"),
      },
      {
        json: "editorCutLongValues",
        js: "editorCutLongValues",
        typ: r("AppBuildid"),
      },
      {
        json: "defaultOverride",
        js: "defaultOverride",
        typ: r("DefaultOverride"),
      },
      {
        json: "editorLinkStyle",
        js: "editorLinkStyle",
        typ: r("IdentifierStyle"),
      },
      { json: "regex", js: "regex", typ: r("AppBuildid") },
      { json: "type", js: "type", typ: r("AppBuildid") },
      { json: "identifier", js: "identifier", typ: r("AppBuildid") },
      { json: "arrayMaxLength", js: "arrayMaxLength", typ: r("AppBuildid") },
    ],
    false
  ),
  DefaultOverride: o(
    [{ json: "description", js: "description", typ: "" }],
    false
  ),
  FieldInstance: o(
    [
      { json: "title", js: "title", typ: "" },
      { json: "required", js: "required", typ: a("") },
      { json: "additionalProperties", js: "additionalProperties", typ: true },
      {
        json: "properties",
        js: "properties",
        typ: r("FieldInstanceProperties"),
      },
      { json: "type", js: "type", typ: a(r("FORCEDREFSType")) },
    ],
    false
  ),
  FieldInstanceProperties: o(
    [
      { json: "__type", js: "__type", typ: r("AppBuildid") },
      { json: "defUid", js: "defUid", typ: r("AppBuildid") },
      { json: "__identifier", js: "__identifier", typ: r("AppBuildid") },
      { json: "__tile", js: "__tile", typ: r("Icon") },
      {
        json: "realEditorValues",
        js: "realEditorValues",
        typ: r("RealEditorValues"),
      },
      { json: "__value", js: "__value", typ: r("DefaultOverride") },
    ],
    false
  ),
  RealEditorValues: o(
    [
      { json: "description", js: "description", typ: "" },
      { json: "items", js: "items", typ: r("RealEditorValuesItems") },
      { json: "type", js: "type", typ: a(r("CustomCommandsType")) },
    ],
    false
  ),
  RealEditorValuesItems: o([], false),
  GridPoint: o(
    [
      { json: "description", js: "description", typ: "" },
      { json: "title", js: "title", typ: "" },
      { json: "required", js: "required", typ: a("") },
      { json: "additionalProperties", js: "additionalProperties", typ: true },
      { json: "properties", js: "properties", typ: r("GridPointProperties") },
      { json: "type", js: "type", typ: a(r("FORCEDREFSType")) },
    ],
    false
  ),
  GridPointProperties: o(
    [
      { json: "cy", js: "cy", typ: r("AppBuildid") },
      { json: "cx", js: "cx", typ: r("AppBuildid") },
    ],
    false
  ),
  IntGridValueDef: o(
    [
      { json: "description", js: "description", typ: "" },
      { json: "title", js: "title", typ: "" },
      { json: "required", js: "required", typ: a("") },
      { json: "additionalProperties", js: "additionalProperties", typ: true },
      {
        json: "properties",
        js: "properties",
        typ: r("IntGridValueDefProperties"),
      },
      { json: "type", js: "type", typ: a(r("FORCEDREFSType")) },
    ],
    false
  ),
  IntGridValueDefProperties: o(
    [
      { json: "tile", js: "tile", typ: r("Icon") },
      { json: "color", js: "color", typ: r("AppBuildid") },
      { json: "identifier", js: "identifier", typ: r("AppBuildid") },
      { json: "value", js: "value", typ: r("AppBuildid") },
      { json: "groupUid", js: "groupUid", typ: r("AppBuildid") },
    ],
    false
  ),
  IntGridValueGroupDef: o(
    [
      { json: "description", js: "description", typ: "" },
      { json: "title", js: "title", typ: "" },
      { json: "required", js: "required", typ: a("") },
      { json: "additionalProperties", js: "additionalProperties", typ: true },
      {
        json: "properties",
        js: "properties",
        typ: r("IntGridValueGroupDefProperties"),
      },
      { json: "type", js: "type", typ: a(r("FORCEDREFSType")) },
    ],
    false
  ),
  IntGridValueGroupDefProperties: o(
    [
      { json: "color", js: "color", typ: r("AppBuildid") },
      { json: "uid", js: "uid", typ: r("AppBuildid") },
      { json: "identifier", js: "identifier", typ: r("AppBuildid") },
    ],
    false
  ),
  IntGridValueInstance: o(
    [
      { json: "description", js: "description", typ: "" },
      { json: "title", js: "title", typ: "" },
      { json: "required", js: "required", typ: a("") },
      { json: "additionalProperties", js: "additionalProperties", typ: true },
      {
        json: "properties",
        js: "properties",
        typ: r("IntGridValueInstanceProperties"),
      },
      { json: "type", js: "type", typ: a(r("FORCEDREFSType")) },
    ],
    false
  ),
  IntGridValueInstanceProperties: o(
    [
      { json: "v", js: "v", typ: r("AppBuildid") },
      { json: "coordId", js: "coordId", typ: r("AppBuildid") },
    ],
    false
  ),
  LayerDef: o(
    [
      { json: "title", js: "title", typ: "" },
      { json: "required", js: "required", typ: a("") },
      { json: "additionalProperties", js: "additionalProperties", typ: true },
      { json: "properties", js: "properties", typ: r("LayerDefProperties") },
      { json: "type", js: "type", typ: a(r("FORCEDREFSType")) },
    ],
    false
  ),
  LayerDefProperties: o(
    [
      { json: "pxOffsetX", js: "pxOffsetX", typ: r("AppBuildid") },
      { json: "tilePivotX", js: "tilePivotX", typ: r("AppBuildid") },
      {
        json: "uiFilterTags",
        js: "uiFilterTags",
        typ: r("RequiredBiomeValues"),
      },
      { json: "displayOpacity", js: "displayOpacity", typ: r("AppBuildid") },
      { json: "parallaxFactorY", js: "parallaxFactorY", typ: r("AppBuildid") },
      { json: "hideInList", js: "hideInList", typ: r("AppBuildid") },
      { json: "__type", js: "__type", typ: r("AppBuildid") },
      { json: "guideGridHei", js: "guideGridHei", typ: r("AppBuildid") },
      { json: "uiColor", js: "uiColor", typ: r("AppBuildid") },
      { json: "doc", js: "doc", typ: r("AppBuildid") },
      { json: "tilesetDefUid", js: "tilesetDefUid", typ: r("AppBuildid") },
      {
        json: "canSelectWhenInactive",
        js: "canSelectWhenInactive",
        typ: r("AppBuildid"),
      },
      { json: "useAsyncRender", js: "useAsyncRender", typ: r("AppBuildid") },
      {
        json: "autoSourceLayerDefUid",
        js: "autoSourceLayerDefUid",
        typ: r("AppBuildid"),
      },
      {
        json: "autoTilesetDefUid",
        js: "autoTilesetDefUid",
        typ: r("AppBuildid"),
      },
      { json: "parallaxScaling", js: "parallaxScaling", typ: r("AppBuildid") },
      {
        json: "renderInWorldView",
        js: "renderInWorldView",
        typ: r("AppBuildid"),
      },
      {
        json: "intGridValuesGroups",
        js: "intGridValuesGroups",
        typ: r("CustomCommands"),
      },
      { json: "inactiveOpacity", js: "inactiveOpacity", typ: r("AppBuildid") },
      { json: "uid", js: "uid", typ: r("AppBuildid") },
      {
        json: "excludedTags",
        js: "excludedTags",
        typ: r("RequiredBiomeValues"),
      },
      {
        json: "hideFieldsWhenInactive",
        js: "hideFieldsWhenInactive",
        typ: r("AppBuildid"),
      },
      { json: "intGridValues", js: "intGridValues", typ: r("CustomCommands") },
      {
        json: "autoRuleGroups",
        js: "autoRuleGroups",
        typ: r("CustomCommands"),
      },
      { json: "type", js: "type", typ: r("IdentifierStyle") },
      { json: "identifier", js: "identifier", typ: r("AppBuildid") },
      { json: "guideGridWid", js: "guideGridWid", typ: r("AppBuildid") },
      {
        json: "requiredTags",
        js: "requiredTags",
        typ: r("RequiredBiomeValues"),
      },
      { json: "pxOffsetY", js: "pxOffsetY", typ: r("AppBuildid") },
      { json: "tilePivotY", js: "tilePivotY", typ: r("AppBuildid") },
      { json: "biomeFieldUid", js: "biomeFieldUid", typ: r("AppBuildid") },
      { json: "gridSize", js: "gridSize", typ: r("AppBuildid") },
      { json: "parallaxFactorX", js: "parallaxFactorX", typ: r("AppBuildid") },
      {
        json: "autoTilesKilledByOtherLayerUid",
        js: "autoTilesKilledByOtherLayerUid",
        typ: r("AppBuildid"),
      },
    ],
    false
  ),
  LayerInstance: o(
    [
      { json: "title", js: "title", typ: "" },
      { json: "required", js: "required", typ: a("") },
      { json: "additionalProperties", js: "additionalProperties", typ: true },
      {
        json: "properties",
        js: "properties",
        typ: r("LayerInstanceProperties"),
      },
      { json: "type", js: "type", typ: a(r("FORCEDREFSType")) },
    ],
    false
  ),
  LayerInstanceProperties: o(
    [
      { json: "__cHei", js: "__cHei", typ: r("AppBuildid") },
      { json: "pxOffsetX", js: "pxOffsetX", typ: r("AppBuildid") },
      {
        json: "__tilesetRelPath",
        js: "__tilesetRelPath",
        typ: r("AppBuildid"),
      },
      { json: "iid", js: "iid", typ: r("AppBuildid") },
      { json: "levelId", js: "levelId", typ: r("AppBuildid") },
      { json: "__type", js: "__type", typ: r("AppBuildid") },
      {
        json: "autoLayerTiles",
        js: "autoLayerTiles",
        typ: r("CustomCommands"),
      },
      {
        json: "optionalRules",
        js: "optionalRules",
        typ: r("RequiredBiomeValues"),
      },
      { json: "__identifier", js: "__identifier", typ: r("AppBuildid") },
      { json: "__gridSize", js: "__gridSize", typ: r("AppBuildid") },
      {
        json: "__pxTotalOffsetY",
        js: "__pxTotalOffsetY",
        typ: r("AppBuildid"),
      },
      { json: "intGridCsv", js: "intGridCsv", typ: r("RequiredBiomeValues") },
      {
        json: "overrideTilesetUid",
        js: "overrideTilesetUid",
        typ: r("AppBuildid"),
      },
      { json: "visible", js: "visible", typ: r("AppBuildid") },
      {
        json: "entityInstances",
        js: "entityInstances",
        typ: r("CustomCommands"),
      },
      { json: "__opacity", js: "__opacity", typ: r("AppBuildid") },
      { json: "seed", js: "seed", typ: r("AppBuildid") },
      { json: "layerDefUid", js: "layerDefUid", typ: r("AppBuildid") },
      {
        json: "__pxTotalOffsetX",
        js: "__pxTotalOffsetX",
        typ: r("AppBuildid"),
      },
      { json: "__cWid", js: "__cWid", typ: r("AppBuildid") },
      { json: "pxOffsetY", js: "pxOffsetY", typ: r("AppBuildid") },
      { json: "__tilesetDefUid", js: "__tilesetDefUid", typ: r("AppBuildid") },
      { json: "gridTiles", js: "gridTiles", typ: r("CustomCommands") },
      { json: "intGrid", js: "intGrid", typ: r("CustomCommands") },
    ],
    false
  ),
  Level: o(
    [
      { json: "description", js: "description", typ: "" },
      { json: "title", js: "title", typ: "" },
      { json: "required", js: "required", typ: a("") },
      { json: "additionalProperties", js: "additionalProperties", typ: true },
      { json: "properties", js: "properties", typ: r("LevelProperties") },
      { json: "type", js: "type", typ: a(r("FORCEDREFSType")) },
    ],
    false
  ),
  LevelProperties: o(
    [
      { json: "__neighbours", js: "__neighbours", typ: r("CustomCommands") },
      { json: "__bgColor", js: "__bgColor", typ: r("AppBuildid") },
      { json: "worldX", js: "worldX", typ: r("AppBuildid") },
      { json: "externalRelPath", js: "externalRelPath", typ: r("AppBuildid") },
      {
        json: "useAutoIdentifier",
        js: "useAutoIdentifier",
        typ: r("AppBuildid"),
      },
      { json: "iid", js: "iid", typ: r("AppBuildid") },
      { json: "bgColor", js: "bgColor", typ: r("AppBuildid") },
      { json: "bgPos", js: "bgPos", typ: r("WorldLayout") },
      { json: "pxHei", js: "pxHei", typ: r("AppBuildid") },
      { json: "worldY", js: "worldY", typ: r("AppBuildid") },
      { json: "__bgPos", js: "__bgPos", typ: r("Icon") },
      { json: "uid", js: "uid", typ: r("AppBuildid") },
      { json: "__smartColor", js: "__smartColor", typ: r("AppBuildid") },
      {
        json: "fieldInstances",
        js: "fieldInstances",
        typ: r("CustomCommands"),
      },
      { json: "pxWid", js: "pxWid", typ: r("AppBuildid") },
      { json: "identifier", js: "identifier", typ: r("AppBuildid") },
      { json: "bgPivotY", js: "bgPivotY", typ: r("AppBuildid") },
      { json: "bgPivotX", js: "bgPivotX", typ: r("AppBuildid") },
      {
        json: "layerInstances",
        js: "layerInstances",
        typ: r("CustomCommands"),
      },
      { json: "bgRelPath", js: "bgRelPath", typ: r("AppBuildid") },
      { json: "worldDepth", js: "worldDepth", typ: r("AppBuildid") },
    ],
    false
  ),
  LevelBgPosInfos: o(
    [
      { json: "description", js: "description", typ: "" },
      { json: "title", js: "title", typ: "" },
      { json: "required", js: "required", typ: a("") },
      { json: "additionalProperties", js: "additionalProperties", typ: true },
      {
        json: "properties",
        js: "properties",
        typ: r("LevelBgPosInfosProperties"),
      },
      { json: "type", js: "type", typ: a(r("FORCEDREFSType")) },
    ],
    false
  ),
  LevelBgPosInfosProperties: o(
    [
      { json: "cropRect", js: "cropRect", typ: r("RequiredBiomeValues") },
      { json: "scale", js: "scale", typ: r("RequiredBiomeValues") },
      { json: "topLeftPx", js: "topLeftPx", typ: r("RequiredBiomeValues") },
    ],
    false
  ),
  NeighbourLevel: o(
    [
      { json: "description", js: "description", typ: "" },
      { json: "title", js: "title", typ: "" },
      { json: "required", js: "required", typ: a("") },
      { json: "additionalProperties", js: "additionalProperties", typ: true },
      {
        json: "properties",
        js: "properties",
        typ: r("NeighbourLevelProperties"),
      },
      { json: "type", js: "type", typ: a(r("FORCEDREFSType")) },
    ],
    false
  ),
  NeighbourLevelProperties: o(
    [
      { json: "levelIid", js: "levelIid", typ: r("AppBuildid") },
      { json: "levelUid", js: "levelUid", typ: r("AppBuildid") },
      { json: "dir", js: "dir", typ: r("AppBuildid") },
    ],
    false
  ),
  TableOfContentEntry: o(
    [
      { json: "title", js: "title", typ: "" },
      { json: "required", js: "required", typ: a("") },
      { json: "additionalProperties", js: "additionalProperties", typ: true },
      {
        json: "properties",
        js: "properties",
        typ: r("TableOfContentEntryProperties"),
      },
      { json: "type", js: "type", typ: a(r("FORCEDREFSType")) },
    ],
    false
  ),
  TableOfContentEntryProperties: o(
    [
      { json: "identifier", js: "identifier", typ: r("AppBuildid") },
      { json: "instancesData", js: "instancesData", typ: r("CustomCommands") },
      { json: "instances", js: "instances", typ: r("CustomCommands") },
    ],
    false
  ),
  Tile: o(
    [
      { json: "description", js: "description", typ: "" },
      { json: "title", js: "title", typ: "" },
      { json: "required", js: "required", typ: a("") },
      { json: "additionalProperties", js: "additionalProperties", typ: true },
      { json: "properties", js: "properties", typ: r("TileProperties") },
      { json: "type", js: "type", typ: a(r("FORCEDREFSType")) },
    ],
    false
  ),
  TileProperties: o(
    [
      { json: "t", js: "t", typ: r("AppBuildid") },
      { json: "d", js: "d", typ: r("RequiredBiomeValues") },
      { json: "px", js: "px", typ: r("RequiredBiomeValues") },
      { json: "a", js: "a", typ: r("AppBuildid") },
      { json: "f", js: "f", typ: r("AppBuildid") },
      { json: "src", js: "src", typ: r("RequiredBiomeValues") },
    ],
    false
  ),
  TileCustomMetadata: o(
    [
      { json: "description", js: "description", typ: "" },
      { json: "title", js: "title", typ: "" },
      { json: "required", js: "required", typ: a("") },
      { json: "additionalProperties", js: "additionalProperties", typ: true },
      {
        json: "properties",
        js: "properties",
        typ: r("TileCustomMetadataProperties"),
      },
      { json: "type", js: "type", typ: a(r("FORCEDREFSType")) },
    ],
    false
  ),
  TileCustomMetadataProperties: o(
    [
      { json: "tileId", js: "tileId", typ: r("AppBuildid") },
      { json: "data", js: "data", typ: r("AppBuildid") },
    ],
    false
  ),
  TilesetDef: o(
    [
      { json: "description", js: "description", typ: "" },
      { json: "title", js: "title", typ: "" },
      { json: "required", js: "required", typ: a("") },
      { json: "additionalProperties", js: "additionalProperties", typ: true },
      { json: "properties", js: "properties", typ: r("TilesetDefProperties") },
      { json: "type", js: "type", typ: a(r("FORCEDREFSType")) },
    ],
    false
  ),
  TilesetDefProperties: o(
    [
      { json: "cachedPixelData", js: "cachedPixelData", typ: r("AppBuildid") },
      { json: "__cHei", js: "__cHei", typ: r("AppBuildid") },
      { json: "pxHei", js: "pxHei", typ: r("AppBuildid") },
      { json: "customData", js: "customData", typ: r("CustomCommands") },
      {
        json: "tagsSourceEnumUid",
        js: "tagsSourceEnumUid",
        typ: r("AppBuildid"),
      },
      { json: "uid", js: "uid", typ: r("AppBuildid") },
      { json: "padding", js: "padding", typ: r("AppBuildid") },
      { json: "enumTags", js: "enumTags", typ: r("CustomCommands") },
      { json: "pxWid", js: "pxWid", typ: r("AppBuildid") },
      { json: "__cWid", js: "__cWid", typ: r("AppBuildid") },
      { json: "spacing", js: "spacing", typ: r("AppBuildid") },
      { json: "identifier", js: "identifier", typ: r("AppBuildid") },
      {
        json: "savedSelections",
        js: "savedSelections",
        typ: r("RequiredBiomeValues"),
      },
      { json: "tags", js: "tags", typ: r("RequiredBiomeValues") },
      { json: "embedAtlas", js: "embedAtlas", typ: r("WorldLayout") },
      { json: "relPath", js: "relPath", typ: r("AppBuildid") },
      { json: "tileGridSize", js: "tileGridSize", typ: r("AppBuildid") },
    ],
    false
  ),
  TilesetRect: o(
    [
      { json: "description", js: "description", typ: "" },
      { json: "title", js: "title", typ: "" },
      { json: "required", js: "required", typ: a("") },
      { json: "additionalProperties", js: "additionalProperties", typ: true },
      { json: "properties", js: "properties", typ: r("TilesetRectProperties") },
      { json: "type", js: "type", typ: a(r("FORCEDREFSType")) },
    ],
    false
  ),
  TilesetRectProperties: o(
    [
      { json: "tilesetUid", js: "tilesetUid", typ: r("AppBuildid") },
      { json: "h", js: "h", typ: r("AppBuildid") },
      { json: "x", js: "x", typ: r("AppBuildid") },
      { json: "y", js: "y", typ: r("AppBuildid") },
      { json: "w", js: "w", typ: r("AppBuildid") },
    ],
    false
  ),
  TocInstanceData: o(
    [
      { json: "title", js: "title", typ: "" },
      { json: "required", js: "required", typ: a("") },
      { json: "additionalProperties", js: "additionalProperties", typ: true },
      {
        json: "properties",
        js: "properties",
        typ: r("TocInstanceDataProperties"),
      },
      { json: "type", js: "type", typ: a(r("FORCEDREFSType")) },
    ],
    false
  ),
  TocInstanceDataProperties: o(
    [
      { json: "worldX", js: "worldX", typ: r("AppBuildid") },
      { json: "widPx", js: "widPx", typ: r("AppBuildid") },
      { json: "worldY", js: "worldY", typ: r("AppBuildid") },
      { json: "heiPx", js: "heiPx", typ: r("AppBuildid") },
      { json: "fields", js: "fields", typ: r("DefaultOverride") },
      { json: "iids", js: "iids", typ: r("Defs") },
    ],
    false
  ),
  World: o(
    [
      { json: "description", js: "description", typ: "" },
      { json: "title", js: "title", typ: "" },
      { json: "required", js: "required", typ: a("") },
      { json: "additionalProperties", js: "additionalProperties", typ: true },
      { json: "properties", js: "properties", typ: r("WorldProperties") },
      { json: "type", js: "type", typ: a(r("FORCEDREFSType")) },
    ],
    false
  ),
  WorldProperties: o(
    [
      { json: "worldGridWidth", js: "worldGridWidth", typ: r("AppBuildid") },
      { json: "iid", js: "iid", typ: r("AppBuildid") },
      { json: "worldGridHeight", js: "worldGridHeight", typ: r("AppBuildid") },
      { json: "worldLayout", js: "worldLayout", typ: r("WorldLayout") },
      {
        json: "defaultLevelWidth",
        js: "defaultLevelWidth",
        typ: r("AppBuildid"),
      },
      { json: "levels", js: "levels", typ: r("CustomCommands") },
      {
        json: "defaultLevelHeight",
        js: "defaultLevelHeight",
        typ: r("AppBuildid"),
      },
      { json: "identifier", js: "identifier", typ: r("AppBuildid") },
    ],
    false
  ),
  FORCEDREFSType: ["boolean", "integer", "null", "number", "object", "string"],
  CustomCommandsType: ["array", "null"],
};

module.exports = {
  lDtkToJson: lDtkToJson,
  toLDtk: toLDtk,
};
