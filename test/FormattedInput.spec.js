import React from "react";
import { convertToObject } from "react-json-renderer";
import { shallow } from "enzyme";

import FormattedInput from "../source/index.js";

test("accepts a value upon initialisation", function() {
    const input = convertToObject(
        <FormattedInput
            value="test value"
            />
    );
    const inputEl = input.props.children;
    expect(inputEl.props.value).toEqual("test value");
});

test("supports optional <input> props", function() {
    const input = convertToObject(
        <FormattedInput
            name="myInput"
            placeholder="Your text here"
            className="class1 class2"
            />
    );
    const inputEl = input.props.children;
    expect(inputEl.props.name).toEqual("myInput");
    expect(inputEl.props.placeholder).toEqual("Your text here");
    expect(inputEl.props.className).toEqual("class1 class2");
});

test("supports password type, which disables format", function() {
    const input = convertToObject(
        <FormattedInput
            value="abc"
            format={[{ char: /a/ }]}
            type="password"
            />
    );
    const inputEl = input.props.children;
    expect(inputEl.props.value).toEqual("abc");
    expect(inputEl.props.type).toEqual("password");
});

test("it forces values to adhere to a pattern", function() {
    const pattern = [
        { char: /[0-9]/, repeat: 2 },
        { exactly: "/" },
        { char: /[12]/ },
        { char: /[0-9]/, repeat: 3 }
    ];
    const input = convertToObject(
        <FormattedInput
            format={pattern}
            value="bad19/2005extra"
            />
    );
    const inputEl = input.props.children;
    expect(inputEl.props.value).toEqual("19/2005");
});

test("enforces maximum length through the use of a pattern", function() {
    const pattern = [
        { char: /./, repeat: 6 }
    ];
    const input = convertToObject(
        <FormattedInput
            format={pattern}
            value="123456789"
            />
    );
    const inputEl = input.props.children;
    expect(inputEl.props.value).toEqual("123456");
});

test("allows partial values", function() {
    const pattern = [
        { char: /[a-z]/i, repeat: 5 }
    ];
    const input = convertToObject(
        <FormattedInput
            format={pattern}
            value="a1bc"
            />
    );
    const inputEl = input.props.children;
    expect(inputEl.props.value).toEqual("abc");
});

test("supports repeating 'exactly' groups", function() {
    const pattern = [
        { char: /[a-z]/i },
        { exactly: "*", repeat: 3 },
        { char: /[a-z]/i }
    ];
    const input = convertToObject(
        <FormattedInput
            format={pattern}
            value="aaaa"
            />
    );
    const inputEl = input.props.children;
    expect(inputEl.props.value).toEqual("a***a");
});

test("automatically enters delimiters", function() {
    const pattern = [
        { char: /[0-9]/, repeat: 4 },
        { exactly: "-" },
        { char: /[0-9]/, repeat: 4 },
        { exactly: "-" },
        { char: /[0-9]/, repeat: 4 },
        { exactly: "-" },
        { char: /[0-9]/, repeat: 4 }
    ];
    const input = convertToObject(
        <FormattedInput
            format={pattern}
            value="3204651290010002"
            />
    );
    const inputEl = input.props.children;
    expect(inputEl.props.value).toEqual("3204-6512-9001-0002");
});

test("fires callback when value changes", function() {
    const pattern = [
        { char: /[0-9]/ },
        { exactly: ":" },
        { char: /[a-zA-Z]/ }
    ];
    return new Promise(function(resolve) {
        const callback = function(formatted, raw) {
            expect(formatted).toEqual("3:a");
            expect(raw).toEqual("3a");
            resolve();
        };
        const wrapper = shallow(
            <FormattedInput
                format={pattern}
                onChange={callback}
                />
        );
        wrapper.simulate("change", { target: { value: "3a" } });
    });
});

test("leaves the value empty if provided as such", function() {
    const pattern = [
        { char: /[0-9]/ },
        { exactly: ":" },
        { char: /[a-zA-Z]/ }
    ];
    const input = convertToObject(
        <FormattedInput
            format={pattern}
            value=""
            />
    );
    const inputEl = input.props.children;
    expect(inputEl.props.value).toEqual("");
});

test("updates to empty correctly", function() {
    const pattern = [
        { char: /[0-9]/ },
        { exactly: ":" },
        { char: /[a-zA-Z]/ }
    ];
    return new Promise(function(resolve) {
        const callback = function(value) {
            expect(value).toEqual("");
            resolve();
        };
        const wrapper = shallow(
            <FormattedInput
                format={pattern}
                value="3a"
                onChange={callback}
                />
        );
        wrapper.simulate("change", { target: { value: "" } });
    });
});

test("leaves out the last delimiter if the string is short", function() {
    const pattern = [
        { char: /[0-9]/ },
        { exactly: ":" },
        { char: /[a-z]/i },
        { exactly: ":" },
        { char: /[a-z]/i }
    ];
    const input = convertToObject(
        <FormattedInput
            format={pattern}
            value="5c"
            />
    );
    const inputEl = input.props.children;
    expect(inputEl.props.value).toEqual("5:c");
});
