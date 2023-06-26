const metadataCache = {
    "tags": [{
        "position": {
            "start": {
                "line": 7,
                "col": 0,
                "offset": 77
            },
            "end": {
                "line": 7,
                "col": 12,
                "offset": 89
            }
        },
        "tag": "#book/review"
    }],
    "headings": [{
        "position": {
            "start": {
                "line": 11,
                "col": 0,
                "offset": 110
            },
            "end": {
                "line": 11,
                "col": 10,
                "offset": 120
            }
        },
        "heading": "Header 1",
        "display": "Header 1",
        "level": 1
    }, {
        "position": {
            "start": {
                "line": 15,
                "col": 0,
                "offset": 135
            },
            "end": {
                "line": 15,
                "col": 14,
                "offset": 149
            }
        },
        "heading": "SubHeader 1",
        "display": "SubHeader 1",
        "level": 2
    }, {
        "position": {
            "start": {
                "line": 19,
                "col": 0,
                "offset": 168
            },
            "end": {
                "line": 19,
                "col": 10,
                "offset": 178
            }
        },
        "heading": "Header 2",
        "display": "Header 2",
        "level": 1
    }, {
        "position": {
            "start": {
                "line": 27,
                "col": 0,
                "offset": 206
            },
            "end": {
                "line": 27,
                "col": 13,
                "offset": 219
            }
        },
        "heading": "Last header",
        "display": "Last header",
        "level": 1
    }],
    "sections": [{
        "type": "yaml",
        "position": {
            "start": {
                "line": 0,
                "col": 0,
                "offset": 0
            },
            "end": {
                "line": 6,
                "col": 3,
                "offset": 76
            }
        }
    }, {
        "type": "paragraph",
        "position": {
            "start": {
                "line": 7,
                "col": 0,
                "offset": 77
            },
            "end": {
                "line": 7,
                "col": 12,
                "offset": 89
            }
        }
    }, {
        "type": "paragraph",
        "position": {
            "start": {
                "line": 9,
                "col": 0,
                "offset": 91
            },
            "end": {
                "line": 9,
                "col": 17,
                "offset": 108
            }
        }
    }, {
        "type": "heading",
        "position": {
            "start": {
                "line": 11,
                "col": 0,
                "offset": 110
            },
            "end": {
                "line": 11,
                "col": 10,
                "offset": 120
            }
        }
    }, {
        "type": "paragraph",
        "position": {
            "start": {
                "line": 13,
                "col": 0,
                "offset": 122
            },
            "end": {
                "line": 13,
                "col": 11,
                "offset": 133
            }
        }
    }, {
        "type": "heading",
        "position": {
            "start": {
                "line": 15,
                "col": 0,
                "offset": 135
            },
            "end": {
                "line": 15,
                "col": 14,
                "offset": 149
            }
        }
    }, {
        "type": "paragraph",
        "position": {
            "start": {
                "line": 17,
                "col": 0,
                "offset": 151
            },
            "end": {
                "line": 17,
                "col": 15,
                "offset": 166
            }
        }
    }, {
        "type": "heading",
        "position": {
            "start": {
                "line": 19,
                "col": 0,
                "offset": 168
            },
            "end": {
                "line": 19,
                "col": 10,
                "offset": 178
            }
        }
    }, {
        "type": "paragraph",
        "position": {
            "start": {
                "line": 21,
                "col": 0,
                "offset": 180
            },
            "end": {
                "line": 22,
                "col": 5,
                "offset": 191
            }
        }
    }, {
        "type": "paragraph",
        "position": {
            "start": {
                "line": 24,
                "col": 0,
                "offset": 193
            },
            "end": {
                "line": 25,
                "col": 5,
                "offset": 204
            }
        }
    }, {
        "type": "heading",
        "position": {
            "start": {
                "line": 27,
                "col": 0,
                "offset": 206
            },
            "end": {
                "line": 27,
                "col": 13,
                "offset": 219
            }
        }
    }, {
        "type": "paragraph",
        "position": {
            "start": {
                "line": 29,
                "col": 0,
                "offset": 221
            },
            "end": {
                "line": 29,
                "col": 26,
                "offset": 247
            }
        }
    }],
    "frontmatter": {
        "lastUpdated": "10/9/2022",
        "length": 47031,
        "tags": ["recipe", "cooking"],
        "position": {
            "start": {
                "line": 0,
                "col": 0,
                "offset": 0
            },
            "end": {
                "line": 6,
                "col": 3,
                "offset": 76
            }
        }
    }
};
const fileContents = `---
lastUpdated: "10/9/2022"
length: 47031
tags:
  - recipe
  - cooking 
---
#book/review

this is something

# Header 1

notes  here

## SubHeader 1

some notes here

# Header 2

notes
otnes

ntoes
notes

# Last header

asdlkfj;asldkfj;asldkfjsdk`;