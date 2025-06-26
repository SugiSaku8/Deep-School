// To parse this data:
//
//   const Convert = require("./file");
//
//   const jrpg = Convert.toJrpg(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime

function toJrpg(json) {
    return cast(JSON.parse(json), r("Jrpg"));
}

function jrpgToJson(value) {
    return JSON.stringify(uncast(value, r("Jrpg")), null, 2);
}

function invalidValue(typ, val, key, parent = '') {
    const prettyTyp = prettyTypeName(typ);
    const parentText = parent ? ` on ${parent}` : '';
    const keyText = key ? ` for key "${key}"` : '';
    throw Error(`Invalid value${keyText}${parentText}. Expected ${prettyTyp} but got ${JSON.stringify(val)}`);
}

function prettyTypeName(typ) {
    if (Array.isArray(typ)) {
        if (typ.length === 2 && typ[0] === undefined) {
            return `an optional ${prettyTypeName(typ[1])}`;
        } else {
            return `one of [${typ.map(a => { return prettyTypeName(a); }).join(", ")}]`;
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
        typ.props.forEach((p) => map[p.json] = { key: p.js, typ: p.typ });
        typ.jsonToJS = map;
    }
    return typ.jsonToJS;
}

function jsToJSONProps(typ) {
    if (typ.jsToJSON === undefined) {
        const map = {};
        typ.props.forEach((p) => map[p.js] = { key: p.json, typ: p.typ });
        typ.jsToJSON = map;
    }
    return typ.jsToJSON;
}

function transform(val, typ, getProps, key = '', parent = '') {
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
        return invalidValue(cases.map(a => { return l(a); }), val, key, parent);
    }

    function transformArray(typ, val) {
        // val must be an array with no invalid elements
        if (!Array.isArray(val)) return invalidValue(l("array"), val, key, parent);
        return val.map(el => transform(el, typ, getProps));
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
        Object.getOwnPropertyNames(props).forEach(key => {
            const prop = props[key];
            const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
            result[prop.key] = transform(v, prop.typ, getProps, key, ref);
        });
        Object.getOwnPropertyNames(val).forEach(key => {
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
        return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
            : typ.hasOwnProperty("arrayItems")    ? transformArray(typ.arrayItems, val)
            : typ.hasOwnProperty("props")         ? transformObject(getProps(typ), typ.additional, val)
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
    "Jrpg": o([
        { json: "format", js: "format", typ: "" },
        { json: "lib_version", js: "lib_version", typ: "" },
        { json: "data_version", js: "data_version", typ: "" },
        { json: "game", js: "game", typ: r("Game") },
        { json: "map", js: "map", typ: r("Map") },
        { json: "story", js: "story", typ: r("JrpgStory") },
        { json: "free", js: "free", typ: r("Free") },
    ], false),
    "Free": o([
    ], false),
    "Game": o([
        { json: "name", js: "name", typ: "" },
        { json: "version", js: "version", typ: "" },
        { json: "copyright", js: "copyright", typ: "" },
    ], false),
    "Map": o([
        { json: "preset", js: "preset", typ: r("Preset") },
    ], false),
    "Preset": o([
        { json: "A1", js: "A1", typ: r("PresetA1") },
    ], false),
    "PresetA1": o([
        { json: "data_tag", js: "data_tag", typ: "" },
        { json: "view_name", js: "view_name", typ: r("ViewName") },
        { json: "info", js: "info", typ: r("Info") },
        { json: "metadata", js: "metadata", typ: r("Metadata") },
    ], false),
    "Info": o([
        { json: "Phase-1", js: "Phase-1", typ: r("ViewName") },
        { json: "Phase-2", js: "Phase-2", typ: r("ViewName") },
        { json: "Phase-3", js: "Phase-3", typ: r("ViewName") },
        { json: "Phase-4", js: "Phase-4", typ: r("ViewName") },
        { json: "Phase-5", js: "Phase-5", typ: r("ViewName") },
        { json: "Phase-Free", js: "Phase-Free", typ: r("ViewName") },
    ], false),
    "ViewName": o([
        { json: "en", js: "en", typ: "" },
        { json: "jp", js: "jp", typ: "" },
    ], false),
    "Metadata": o([
        { json: "name", js: "name", typ: "" },
        { json: "version", js: "version", typ: "" },
        { json: "author", js: "author", typ: "" },
        { json: "date", js: "date", typ: "" },
        { json: "view", js: "view", typ: r("View") },
    ], false),
    "View": o([
        { json: "image", js: "image", typ: r("Image") },
        { json: "style", js: "style", typ: r("StyleClass") },
    ], false),
    "Image": o([
        { json: "path", js: "path", typ: r("Path") },
    ], false),
    "Path": o([
        { json: "_bg", js: "_bg", typ: "" },
        { json: "_composite", js: "_composite", typ: "" },
        { json: "data", js: "data", typ: "" },
        { json: "Floor_OLD_Layer", js: "Floor_OLD_Layer", typ: "" },
        { json: "Floor_New_Layer", js: "Floor_New_Layer", typ: "" },
        { json: "TOBIRA_OLD_RIGHT_Layer", js: "TOBIRA_OLD_RIGHT_Layer", typ: "" },
        { json: "TOBIRA_OLD_LEFT_Layer", js: "TOBIRA_OLD_LEFT_Layer", typ: "" },
        { json: "TOBIRA_OLD_SIDE_Layer", js: "TOBIRA_OLD_SIDE_Layer", typ: "" },
    ], false),
    "StyleClass": o([
        { json: "raw", js: "raw", typ: "" },
        { json: "content", js: "content", typ: a("") },
    ], false),
    "JrpgStory": o([
        { json: "Phase-1", js: "Phase-1", typ: r("Phase") },
        { json: "Phase-2", js: "Phase-2", typ: r("Phase") },
        { json: "Phase-3", js: "Phase-3", typ: r("Phase") },
        { json: "Phase-4", js: "Phase-4", typ: r("Phase") },
        { json: "Phase-5", js: "Phase-5", typ: r("Phase") },
    ], false),
    "Phase": o([
        { json: "A1", js: "A1", typ: r("Phase1_A1") },
    ], false),
    "Phase1_A1": o([
        { json: "introduction", js: "introduction", typ: r("A") },
        { json: "a", js: "a", typ: r("A") },
        { json: "b", js: "b", typ: r("A") },
        { json: "c", js: "c", typ: r("A") },
        { json: "d", js: "d", typ: r("A") },
    ], false),
    "A": o([
        { json: "title", js: "title", typ: r("ViewName") },
        { json: "story", js: "story", typ: r("AStory") },
    ], false),
    "AStory": o([
        { json: "style", js: "style", typ: r("StyleEnum") },
        { json: "text", js: "text", typ: r("ViewName") },
    ], false),
    "StyleEnum": [
        "auto",
    ],
};

module.exports = {
    "jrpgToJson": jrpgToJson,
    "toJrpg": toJrpg,
};
