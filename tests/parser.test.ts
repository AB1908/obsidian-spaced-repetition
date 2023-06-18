import {parse} from "src/parser";
import {CardType} from "src/scheduling";
import type {SRSettings} from "src/settings";

const defaultArgs = {
    singlelineCardSeparator: "::",
    singlelineReversedCardSeparator: ":::",
    multilineCardSeparator: "?",
    multilineReversedCardSeparator: "??",
    convertHighlightsToClozes: true,
    convertBoldTextToClozes: true,
    convertCurlyBracketsToClozes: true
} as SRSettings;

const parseTextWithDefaultSettings = (text: string) => parse(text, defaultArgs);

test("Test parsing of single line basic cards", () => {
    expect(parseTextWithDefaultSettings("Question::Answer")).toEqual([
        {cardType: CardType.SingleLineBasic, cardText: "Question::Answer", lineNo: 0},
    ]);
    expect(parseTextWithDefaultSettings(`Question::Answer\n<!--SR:!2021-08-11,4,270-->`)).toEqual([
        {
            cardType: CardType.SingleLineBasic,
            cardText: `Question::Answer\n<!--SR:!2021-08-11,4,270-->`,
            lineNo: 0,
        },
    ]);
    expect(parseTextWithDefaultSettings(`Question::Answer <!--SR:!2021-08-11,4,270-->`)).toEqual([
        {
            cardType: CardType.SingleLineBasic,
            cardText: `Question::Answer <!--SR:!2021-08-11,4,270-->`,
            lineNo: 0,
        },
    ]);
    expect(parseTextWithDefaultSettings("Some text before\nQuestion ::Answer")).toEqual([
        {cardType: CardType.SingleLineBasic, cardText: "Question ::Answer", lineNo: 1},
    ]);
    expect(parseTextWithDefaultSettings("#Title\n\nQ1::A1\nQ2:: A2")).toEqual([
        {cardType: CardType.SingleLineBasic, cardText: "Q1::A1", lineNo: 2},
        {cardType: CardType.SingleLineBasic, cardText: "Q2:: A2", lineNo: 3},
    ]);
});

test("Test parsing of single line reversed cards", () => {
    expect(parseTextWithDefaultSettings("Question:::Answer")).toEqual([
        {cardType: CardType.SingleLineReversed, cardText: "Question:::Answer", lineNo: 0},
    ]);
    expect(parseTextWithDefaultSettings("Some text before\nQuestion :::Answer")).toEqual([
        {cardType: CardType.SingleLineReversed, cardText: "Question :::Answer", lineNo: 1},
    ]);
    expect(parseTextWithDefaultSettings("#Title\n\nQ1:::A1\nQ2::: A2")).toEqual([
        {cardType: CardType.SingleLineReversed, cardText: "Q1:::A1", lineNo: 2},
        {cardType: CardType.SingleLineReversed, cardText: "Q2::: A2", lineNo: 3},
    ]);
});

test("Test parsing of multi line basic cards", () => {
    expect(parseTextWithDefaultSettings("Question\n?\nAnswer")).toEqual([
        {cardType: CardType.MultiLineBasic, cardText: "Question\n?\nAnswer", lineNo: 1},
    ]);
    expect(parseTextWithDefaultSettings("Question\n?\nAnswer <!--SR:!2021-08-11,4,270-->")).toEqual([
        {
            cardType: CardType.MultiLineBasic,
            cardText: "Question\n?\nAnswer <!--SR:!2021-08-11,4,270-->",
            lineNo: 1,
        },
    ]);
    expect(parseTextWithDefaultSettings("Question\n?\nAnswer\n<!--SR:2021-08-11,4,270-->")).toEqual([
        {
            cardType: CardType.MultiLineBasic,
            cardText: "Question\n?\nAnswer\n<!--SR:2021-08-11,4,270-->",
            lineNo: 1,
        },
    ]);
    expect(parseTextWithDefaultSettings("Some text before\nQuestion\n?\nAnswer")).toEqual([
        {
            cardType: CardType.MultiLineBasic,
            cardText: "Some text before\nQuestion\n?\nAnswer",
            lineNo: 2,
        },
    ]);
    expect(parseTextWithDefaultSettings("Question\n?\nAnswer\nSome text after!")).toEqual([
        {
            cardType: CardType.MultiLineBasic,
            cardText: "Question\n?\nAnswer\nSome text after!",
            lineNo: 1,
        },
    ]);
    expect(
        parseTextWithDefaultSettings("#Title\n\nLine0\nQ1\n?\nA1\nAnswerExtra\n\nQ2\n?\nA2")
    ).toEqual([
        {cardType: CardType.MultiLineBasic, cardText: "Line0\nQ1\n?\nA1\nAnswerExtra", lineNo: 4},
        {cardType: CardType.MultiLineBasic, cardText: "Q2\n?\nA2", lineNo: 9},
    ]);
});

test("Test parsing of multi line reversed cards", () => {
    expect(parseTextWithDefaultSettings("Question\n??\nAnswer")).toEqual([
        {cardType: CardType.MultiLineReversed, cardText: "Question\n??\nAnswer", lineNo: 1},
    ]);
    expect(parseTextWithDefaultSettings("Some text before\nQuestion\n??\nAnswer")).toEqual([
        {
            cardType: CardType.MultiLineReversed,
            cardText: "Some text before\nQuestion\n??\nAnswer",
            lineNo: 2,
        },
    ]);
    expect(parseTextWithDefaultSettings("Question\n??\nAnswer\nSome text after!")).toEqual([
        {
            cardType: CardType.MultiLineReversed,
            cardText: "Question\n??\nAnswer\nSome text after!",
            lineNo: 1,
        },
    ]);
    expect(
        parseTextWithDefaultSettings("#Title\n\nLine0\nQ1\n??\nA1\nAnswerExtra\n\nQ2\n??\nA2")
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
    expect(parseTextWithDefaultSettings("cloze ==deletion== test")).toEqual([
        {cardType: CardType.Cloze, cardText: "cloze ==deletion== test", lineNo: 0},
    ]);
    expect(
        parseTextWithDefaultSettings("cloze ==deletion== test\n<!--SR:2021-08-11,4,270-->")
    ).toEqual([
        {
            cardType: CardType.Cloze,
            cardText: "cloze ==deletion== test\n<!--SR:2021-08-11,4,270-->",
            lineNo: 0,
        },
    ]);
    expect(
        parseTextWithDefaultSettings("cloze ==deletion== test <!--SR:2021-08-11,4,270-->")
    ).toEqual([
        {
            cardType: CardType.Cloze,
            cardText: "cloze ==deletion== test <!--SR:2021-08-11,4,270-->",
            lineNo: 0,
        },
    ]);
    expect(parseTextWithDefaultSettings("==this== is a ==deletion==\n")).toEqual([
        {cardType: CardType.Cloze, cardText: "==this== is a ==deletion==", lineNo: 0},
    ]);
    expect(
        parseTextWithDefaultSettings(
            `some text before

a deletion on
such ==wow==

many text
such surprise ==wow== more ==text==
some text after

Hmm`)
    ).toEqual([
        {cardType: CardType.Cloze, cardText: "a deletion on\nsuch ==wow==", lineNo: 3},
        {
            cardType: CardType.Cloze,
            cardText: "many text\nsuch surprise ==wow== more ==text==\nsome text after",
            lineNo: 6,
        },
    ]);
    expect(parseTextWithDefaultSettings("srdf ==")).toEqual([]);
    expect(parseTextWithDefaultSettings("lorem ipsum ==p\ndolor won==")).toEqual([]);
    expect(parseTextWithDefaultSettings("lorem ipsum ==dolor won=")).toEqual([]);
    // ==highlights== turned off
    expect(parse("cloze ==deletion== test", {...defaultArgs, convertHighlightsToClozes: false})).toEqual([] );

    // **bolded**
    expect(parseTextWithDefaultSettings("cloze **deletion** test")).toEqual([
        {cardType: CardType.Cloze, cardText: "cloze **deletion** test", lineNo: 0},
    ]);
    expect(
        parseTextWithDefaultSettings("cloze **deletion** test\n<!--SR:2021-08-11,4,270-->")
    ).toEqual([
        {
            cardType: CardType.Cloze,
            cardText: "cloze **deletion** test\n<!--SR:2021-08-11,4,270-->",
            lineNo: 0,
        },
    ]);
    expect(
        parseTextWithDefaultSettings("cloze **deletion** test <!--SR:2021-08-11,4,270-->")
    ).toEqual([
        {
            cardType: CardType.Cloze,
            cardText: "cloze **deletion** test <!--SR:2021-08-11,4,270-->",
            lineNo: 0,
        },
    ]);
    expect(parseTextWithDefaultSettings("**this** is a **deletion**\n")).toEqual([
        {cardType: CardType.Cloze, cardText: "**this** is a **deletion**", lineNo: 0},
    ]);
    expect(
        parse(
            "some text before\n\na deletion on\nsuch **wow**\n\n" +
            "many text\nsuch surprise **wow** more **text**\nsome text after\n\nHmm",
            defaultArgs
        )
    ).toEqual([
        {cardType: CardType.Cloze, cardText: "a deletion on\nsuch **wow**", lineNo: 3},
        {
            cardType: CardType.Cloze,
            cardText: "many text\nsuch surprise **wow** more **text**\nsome text after",
            lineNo: 6,
        },
    ]);
    expect(parseTextWithDefaultSettings("srdf **")).toEqual([]);
    expect(parseTextWithDefaultSettings("lorem ipsum **p\ndolor won**")).toEqual([]);
    expect(parseTextWithDefaultSettings("lorem ipsum **dolor won*")).toEqual([]);
    // **bolded** turned off
    expect(parse("cloze **deletion** test", {...defaultArgs, convertBoldTextToClozes: false})).toEqual([]);

    // both
    expect(parseTextWithDefaultSettings("cloze **deletion** test ==another deletion==!")).toEqual([
        {
            cardType: CardType.Cloze,
            cardText: "cloze **deletion** test ==another deletion==!",
            lineNo: 0,
        },
    ]);
});

test("Test parsing of a mix of card types", () => {
    expect(
        parseTextWithDefaultSettings(
            `# Lorem Ipsum

Lorem ipsum dolor ==sit amet==, consectetur ==adipiscing== elit.
Duis magna arcu, eleifend rhoncus ==euismod non,==
laoreet vitae enim.

Fusce placerat::velit in pharetra gravida

Donec dapibus ullamcorper aliquam.
??
Donec dapibus ullamcorper aliquam.
<!--SR:2021-08-11,4,270-->`)
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
        parseTextWithDefaultSettings(
            `How do you ... Python?
?
\`\`\`
print('Hello World!')
print('Howdy?')
lambda x: x[0]
\`\`\``)
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
        parseTextWithDefaultSettings(
            `How do you ... Python?
?
\`\`\`
print('Hello World!')


print('Howdy?')

lambda x: x[0]
\`\`\``)
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
        parseTextWithDefaultSettings(
            `Nested Markdown?
?
\`\`\`\`ad-note

\`\`\`git
+ print('hello')
- print('world')
\`\`\`

~~~python
print('hello world')
~~~
\`\`\`\``)
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
        parseTextWithDefaultSettings("<!--\nQuestion\n?\nAnswer <!--SR:!2021-08-11,4,270-->\n-->")
    ).toEqual([]);
    expect(
        parseTextWithDefaultSettings(
            "<!--\nQuestion\n?\nAnswer <!--SR:!2021-08-11,4,270-->\n\n<!--cloze ==deletion== test-->-->"
        )
    ).toEqual([]);
    expect(parseTextWithDefaultSettings("<!--cloze ==deletion== test-->")).toEqual([]);
    expect(parseTextWithDefaultSettings("<!--cloze **deletion** test-->")).toEqual([]);
});
