import { parse } from "src/parser";
import { CardType } from "src/scheduling";

const defaultArgs: [string, string, string, string, boolean, boolean] = [
    "::",
    ":::",
    "?",
    "??",
    true,
    true,
];

test("Test parsing of single line basic cards", () => {
    expect(parse("Question::Answer", ...defaultArgs, true)).toEqual([
        { cardType: CardType.SingleLineBasic, cardText: "Question::Answer", lineNo: 0 },
    ]);
    const schedulingComment = "<!--SR:!2021-08-11,4,270-->";
    expect(parse(`Question::Answer\n${schedulingComment}`, ...defaultArgs, true)).toEqual([
        {
            cardType: CardType.SingleLineBasic,
            cardText: `Question::Answer\n${schedulingComment}`,
            lineNo: 0,
        },
    ]);
    expect(parse(`Question::Answer ${schedulingComment}`, ...defaultArgs, true)).toEqual([
        {
            cardType: CardType.SingleLineBasic,
            cardText: `Question::Answer ${schedulingComment}`,
            lineNo: 0,
        },
    ]);
    expect(parse("Some text before\nQuestion ::Answer", ...defaultArgs, true)).toEqual([
        { cardType: CardType.SingleLineBasic, cardText: "Question ::Answer", lineNo: 1 },
    ]);
    expect(parse("#Title\n\nQ1::A1\nQ2:: A2", ...defaultArgs, true)).toEqual([
        { cardType: CardType.SingleLineBasic, cardText: "Q1::A1", lineNo: 2 },
        { cardType: CardType.SingleLineBasic, cardText: "Q2:: A2", lineNo: 3 },
    ]);
});

test("Test parsing of single line reversed cards", () => {
    expect(parse("Question:::Answer", ...defaultArgs, true)).toEqual([
        { cardType: CardType.SingleLineReversed, cardText: "Question:::Answer", lineNo: 0 },
    ]);
    expect(parse("Some text before\nQuestion :::Answer", ...defaultArgs, true)).toEqual([
        { cardType: CardType.SingleLineReversed, cardText: "Question :::Answer", lineNo: 1 },
    ]);
    expect(parse("#Title\n\nQ1:::A1\nQ2::: A2", ...defaultArgs, true)).toEqual([
        { cardType: CardType.SingleLineReversed, cardText: "Q1:::A1", lineNo: 2 },
        { cardType: CardType.SingleLineReversed, cardText: "Q2::: A2", lineNo: 3 },
    ]);
});

test("Test parsing of multi line basic cards", () => {
    expect(parse("Question\n?\nAnswer", ...defaultArgs, true)).toEqual([
        { cardType: CardType.MultiLineBasic, cardText: "Question\n?\nAnswer", lineNo: 1 },
    ]);
    expect(parse("Question\n?\nAnswer <!--SR:!2021-08-11,4,270-->", ...defaultArgs, true)).toEqual([
        {
            cardType: CardType.MultiLineBasic,
            cardText: "Question\n?\nAnswer <!--SR:!2021-08-11,4,270-->",
            lineNo: 1,
        },
    ]);
    expect(parse("Question\n?\nAnswer\n<!--SR:2021-08-11,4,270-->", ...defaultArgs, true)).toEqual([
        {
            cardType: CardType.MultiLineBasic,
            cardText: "Question\n?\nAnswer\n<!--SR:2021-08-11,4,270-->",
            lineNo: 1,
        },
    ]);
    expect(parse("Some text before\nQuestion\n?\nAnswer", ...defaultArgs, true)).toEqual([
        {
            cardType: CardType.MultiLineBasic,
            cardText: "Some text before\nQuestion\n?\nAnswer",
            lineNo: 2,
        },
    ]);
    expect(parse("Question\n?\nAnswer\nSome text after!", ...defaultArgs, true)).toEqual([
        {
            cardType: CardType.MultiLineBasic,
            cardText: "Question\n?\nAnswer\nSome text after!",
            lineNo: 1,
        },
    ]);
    expect(
        parse("#Title\n\nLine0\nQ1\n?\nA1\nAnswerExtra\n\nQ2\n?\nA2", ...defaultArgs, true)
    ).toEqual([
        { cardType: CardType.MultiLineBasic, cardText: "Line0\nQ1\n?\nA1\nAnswerExtra", lineNo: 4 },
        { cardType: CardType.MultiLineBasic, cardText: "Q2\n?\nA2", lineNo: 9 },
    ]);
});

test("Test parsing of multi line reversed cards", () => {
    expect(parse("Question\n??\nAnswer", ...defaultArgs, true)).toEqual([
        { cardType: CardType.MultiLineReversed, cardText: "Question\n??\nAnswer", lineNo: 1 },
    ]);
    expect(parse("Some text before\nQuestion\n??\nAnswer", ...defaultArgs, true)).toEqual([
        {
            cardType: CardType.MultiLineReversed,
            cardText: "Some text before\nQuestion\n??\nAnswer",
            lineNo: 2,
        },
    ]);
    expect(parse("Question\n??\nAnswer\nSome text after!", ...defaultArgs, true)).toEqual([
        {
            cardType: CardType.MultiLineReversed,
            cardText: "Question\n??\nAnswer\nSome text after!",
            lineNo: 1,
        },
    ]);
    expect(
        parse("#Title\n\nLine0\nQ1\n??\nA1\nAnswerExtra\n\nQ2\n??\nA2", ...defaultArgs, true)
    ).toEqual([
        {
            cardType: CardType.MultiLineReversed,
            cardText: "Line0\nQ1\n??\nA1\nAnswerExtra",
            lineNo: 4,
        },
        {
            cardType: CardType.MultiLineReversed,
            cardText: "Q2\n??\nA2",
            lineNo: 9,
        },
    ]);
});

test("Test parsing of cloze cards", () => {
    // ==highlights==
    expect(parse("cloze ==deletion== test", ...defaultArgs, true)).toEqual([
        { cardType: CardType.Cloze, cardText: "cloze ==deletion== test", lineNo: 0 },
    ]);
    expect(
        parse("cloze ==deletion== test\n<!--SR:2021-08-11,4,270-->", ...defaultArgs, true)
    ).toEqual([
        {
            cardType: CardType.Cloze,
            cardText: "cloze ==deletion== test\n<!--SR:2021-08-11,4,270-->",
            lineNo: 0,
        },
    ]);
    expect(
        parse("cloze ==deletion== test <!--SR:2021-08-11,4,270-->", ...defaultArgs, true)
    ).toEqual([
        {
            cardType: CardType.Cloze,
            cardText: "cloze ==deletion== test <!--SR:2021-08-11,4,270-->",
            lineNo: 0,
        },
    ]);
    expect(parse("==this== is a ==deletion==\n", ...defaultArgs, true)).toEqual([
        { cardType: CardType.Cloze, cardText: "==this== is a ==deletion==", lineNo: 0 },
    ]);
    expect(
        parse(
            "some text before\n\na deletion on\nsuch ==wow==\n\n" +
                "many text\nsuch surprise ==wow== more ==text==\nsome text after\n\nHmm",
            ...defaultArgs,
            true
        )
    ).toEqual([
        { cardType: CardType.Cloze, cardText: "a deletion on\nsuch ==wow==", lineNo: 3 },
        {
            cardType: CardType.Cloze,
            cardText: "many text\nsuch surprise ==wow== more ==text==\nsome text after",
            lineNo: 6,
        },
    ]);
    expect(parse("srdf ==", ...defaultArgs, true)).toEqual([]);
    expect(parse("lorem ipsum ==p\ndolor won==", ...defaultArgs, true)).toEqual([]);
    expect(parse("lorem ipsum ==dolor won=", ...defaultArgs, true)).toEqual([]);
    // ==highlights== turned off
    expect(parse("cloze ==deletion== test", "::", ":::", "?", "??", false, true, true)).toEqual([]);

    // **bolded**
    expect(parse("cloze **deletion** test", ...defaultArgs, true)).toEqual([
        { cardType: CardType.Cloze, cardText: "cloze **deletion** test", lineNo: 0 },
    ]);
    expect(
        parse("cloze **deletion** test\n<!--SR:2021-08-11,4,270-->", ...defaultArgs, true)
    ).toEqual([
        {
            cardType: CardType.Cloze,
            cardText: "cloze **deletion** test\n<!--SR:2021-08-11,4,270-->",
            lineNo: 0,
        },
    ]);
    expect(
        parse("cloze **deletion** test <!--SR:2021-08-11,4,270-->", ...defaultArgs, true)
    ).toEqual([
        {
            cardType: CardType.Cloze,
            cardText: "cloze **deletion** test <!--SR:2021-08-11,4,270-->",
            lineNo: 0,
        },
    ]);
    expect(parse("**this** is a **deletion**\n", ...defaultArgs, true)).toEqual([
        { cardType: CardType.Cloze, cardText: "**this** is a **deletion**", lineNo: 0 },
    ]);
    expect(
        parse(
            "some text before\n\na deletion on\nsuch **wow**\n\n" +
                "many text\nsuch surprise **wow** more **text**\nsome text after\n\nHmm",
            ...defaultArgs,
            true
        )
    ).toEqual([
        { cardType: CardType.Cloze, cardText: "a deletion on\nsuch **wow**", lineNo: 3 },
        {
            cardType: CardType.Cloze,
            cardText: "many text\nsuch surprise **wow** more **text**\nsome text after",
            lineNo: 6,
        },
    ]);
    expect(parse("srdf **", ...defaultArgs, true)).toEqual([]);
    expect(parse("lorem ipsum **p\ndolor won**", ...defaultArgs, true)).toEqual([]);
    expect(parse("lorem ipsum **dolor won*", ...defaultArgs, true)).toEqual([]);
    // **bolded** turned off
    expect(parse("cloze **deletion** test", "::", ":::", "?", "??", true, false, true)).toEqual([]);

    // both
    expect(parse("cloze **deletion** test ==another deletion==!", ...defaultArgs, true)).toEqual([
        {
            cardType: CardType.Cloze,
            cardText: "cloze **deletion** test ==another deletion==!",
            lineNo: 0,
        },
    ]);
});

test("Test parsing of a mix of card types", () => {
    expect(
        parse(
            "# Lorem Ipsum\n\nLorem ipsum dolor ==sit amet==, consectetur ==adipiscing== elit.\n" +
                "Duis magna arcu, eleifend rhoncus ==euismod non,==\nlaoreet vitae enim.\n\n" +
                "Fusce placerat::velit in pharetra gravida\n\n" +
                "Donec dapibus ullamcorper aliquam.\n??\nDonec dapibus ullamcorper aliquam.\n<!--SR:2021-08-11,4,270-->",
            ...defaultArgs,
            true
        )
    ).toEqual(
    [
          {
            "cardText": "Lorem ipsum dolor ==sit amet==, consectetur ==adipiscing== elit.\nDuis magna arcu, eleifend rhoncus ==euismod non,==\nlaoreet vitae enim.",
            "cardType": 4,
            "lineNo": 2,
          },
          {
            "cardText": "Fusce placerat::velit in pharetra gravida",
            "cardType": 0,
            "lineNo": 6,
          },
          {
            "cardText": "Donec dapibus ullamcorper aliquam.\n??\nDonec dapibus ullamcorper aliquam.\n<!--SR:2021-08-11,4,270-->",
            "cardType": 3,
            "lineNo": 9,
          },
        ]
    );
});

test("Test codeblocks", () => {
    // no blank lines
    expect(
        parse(
            "How do you ... Python?\n?\n" +
                "```\nprint('Hello World!')\nprint('Howdy?')\nlambda x: x[0]\n```",
            ...defaultArgs,
            true
        )
    ).toEqual([
        {
            cardType: CardType.MultiLineBasic,
            cardText:
                "How do you ... Python?\n?\n" +
                "```\nprint('Hello World!')\nprint('Howdy?')\nlambda x: x[0]\n```",
            lineNo: 1,
        },
    ]);

    // with blank lines
    expect(
        parse(
            "How do you ... Python?\n?\n" +
                "```\nprint('Hello World!')\n\n\nprint('Howdy?')\n\nlambda x: x[0]\n```",
            ...defaultArgs,
            true
        )
    ).toEqual([
        {
            cardType: CardType.MultiLineBasic,
            cardText:
                "How do you ... Python?\n?\n" +
                "```\nprint('Hello World!')\n\n\nprint('Howdy?')\n\nlambda x: x[0]\n```",
            lineNo: 1,
        },
    ]);

    // general Markdown syntax
    expect(
        parse(
            "Nested Markdown?\n?\n" +
                "````ad-note\n\n" +
                "```git\n" +
                "+ print('hello')\n" +
                "- print('world')\n" +
                "```\n\n" +
                "~~~python\n" +
                "print('hello world')\n" +
                "~~~\n" +
                "````",
            ...defaultArgs,
            true
        )
    ).toEqual(
        [
            {
                "cardText": "Nested Markdown?\n?\n````ad-note\n\n```git\n+ print('hello')\n- print('world')\n```\n\n~~~python\nprint('hello world')\n~~~\n````",
                "cardType": 2,
                "lineNo": 1
            }
        ]

    );
});

test("Test not parsing cards in HTML comments", () => {
    expect(
        parse("<!--\nQuestion\n?\nAnswer <!--SR:!2021-08-11,4,270-->\n-->", ...defaultArgs, true)
    ).toEqual([]);
    expect(
        parse(
            "<!--\nQuestion\n?\nAnswer <!--SR:!2021-08-11,4,270-->\n\n<!--cloze ==deletion== test-->-->",
            ...defaultArgs,
            true
        )
    ).toEqual([]);
    expect(parse("<!--cloze ==deletion== test-->", ...defaultArgs, true)).toEqual([]);
    expect(parse("<!--cloze **deletion** test-->", ...defaultArgs, true)).toEqual([]);
});
