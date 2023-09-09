# Obsidian Card Coverage

<img src="https://img.shields.io/github/downloads/ab1908/obsidian-spaced-repetition/total" /> <img src="https://img.shields.io/github/downloads/ab1908/obsidian-spaced-repetition/latest/total?style=flat-square" /> <img src="https://img.shields.io/github/manifest-json/v/ab1908/obsidian-spaced-repetition?style=flat-square" />

In software testing, we use the idea of test coverage to understand how much of the codebase has tests.
Since flashcards are about testing your memory, I thought of applying the idea of test coverage to books and other content I read to gauge how much of it I remember.
The plugin also comes with first class mobile support as I use my phone for flashcard review more than my desktop.

Here's a primer to flashcards and the idea of spaced repetition [How To Remember Anything Forever-ish - Nicky Case](https://ncase.me/remember/)

Many thanks to @st3v3nmw for his initial work with [Obsidian Spaced Repetition](https://github.com/st3v3nmw/obsidian-spaced-repetition/) which has been invaluable to me.
This plugin started as a fork (which is why it has the same repo name), but gradually evolved into a rewrite.
This is not backwards compatible with the original SRS plugin though I may add it at a later date.

## Installation

I do not plan to add this to the community plugins list soon. Instead, use BRAT.

1. Install this plugin using [TfTHacker's BRAT](https://github.com/TfTHacker/obsidian42-brat).

    - Install BRAT from Community Plugins

    - Use this repo's URL (https://github.com/AB1908/obsidian-spaced-repetition) to install a plugin from URL in BRAT.

Note: This plugin relies on the export format from my [Moon Reader plugin](https://github.com/AB1908/obsidian-moon-reader). Turn on experimental SRS support to use the intended export format.

## Usage

WARNING: Legacy SRS flashcards are not supported due to a breaking change in the metadata format. Please remove `#flashcard` tags from files with legacy flashcards.

1. Card Coverage expects files with Moon+ Reader annotations to be tagged with `review/book`.
My Moon Reader plugin adds this to the parsed export automatically.
It also expects the file containing annotations to be inside a folder with the book name.
For example, `/Atomic Habits` will contain all files related to the book.
Inside, I will have `Annotations.md` which contains all my annotations.
Card Coverage will create a `Flashcards.md` alongside it.
This is not configurable for now.

2. You can add a deck using the "Add New Deck" option.
This creates a new flashcard note in the same directory as explained earlier.

3. Don't change any settings for now.
I am working on revamping it.

Please check the [assets](assets) folder for screenshots.
I couldn't figure out how to add them to the readme without them taking up too much space.

## Why should I use this?

Well, if you've been interested in remembering what you read, you've probably noticed that existing plugins or even spaced repetition apps don't tell you how much of something you remember.
The original SRS plugin by Stephen is excellent, but it doesn't let me create flashcards from certain highlights or paragraphs.
With this plugin, you can create flashcards that map to whatever you annotate in a book.

I usually annotate a lot while reading, marking up things that I think are core ideas or interesting tidbits that I want to retain from the book.
I wanted to be able to create 2-3 annotations for each highlight to test myself on the idea in various ways to ensure it stuck.
The only other app I've seen that implements this idea to a degree is [Readwise](https://readwise.io).
However, being an Obsidian user, I was deeply uncomfortable sharing my annotation and reading data with a third party.
That's how this plugin was born.

It also made sense to use the idea of test coverage as a metric to see how many annotations I have tested myself on.
The higher the percentage, the more I (should) remember from a book and the more useful it would be to me.
Hopefully, the name conveys the intention well.
If not, well, I tried.

## Contributions

Please open an issue if you have a request or have encountered a bug.
Please understand that I have primarily created this for personal use and may choose not to work on certain issues or features if I do not find them useful or relevant.
That said, I am very happy to guide people who want to contribute.