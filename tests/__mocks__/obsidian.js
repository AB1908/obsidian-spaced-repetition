// const { metadataCache } = require("tests/disk.test");

const actualMoment = jest.requireActual("moment");

// A function that can be called as `moment()`
const momentWrapper = (ts) =>
    ts ? actualMoment(ts) : actualMoment("2025-12-08T08:00:00.000Z");

// Copy all static properties from the actual moment to the wrapper
const mockMoment = Object.assign(momentWrapper, actualMoment);

// Overwrite .locale() with a Jest mock function
mockMoment.locale = jest.fn(() => 'en');
const moment_2 = mockMoment;

// Mock TFile class (or just an object that behaves like it)
class MockTFile {
    constructor(path) {
        this.path = path;
        // Add other properties that might be accessed, e.g., parent, basename
        this.parent = { name: path.split('/').slice(0, -1).join('/') || '', path: path.split('/').slice(0, -1).join('/') || '' };
        this.basename = path.split('/').pop().replace(/\.md$/, '');
    }
}

const app = {
    metadataCache: {
        fileCache: {
            "Atomic Habits/Annotations.md": {
                "mtime": 1694272816635,
                "size": 1763,
                "hash": "58b48c275a2bb48fbdf058ce2f1ae4d64bdff04de5e1e9ee30618cb846d827e0"
            },
            "Atomic Habits/Flashcards.md": {
                "mtime": 1730058712263,
                "size": 505,
                "hash": "e15873f463bc22d731a37e67085e3ee89609ca368b298e4951266589fb21cdf1"
            },
            "Book Exports/Clear, James - Atomic habits_ an easy & proven way to build good habits & break bad ones (2018, Penguin Publishing Group_Avery) - libgen.li.mrexpt": {
                "mtime": 1693031566934,
                "size": 23256,
                "hash": ""
            },
            "Book Exports/Learning A Very Short Introduction by Mark Haselgrove.mrexpt": {
                "mtime": 1669301184303,
                "size": 4117,
                "hash": ""
            },
            "Book Exports/Memory A Very Short Introduction by Jonathan K. Foster.mrexpt": {
                "mtime": 1649018927425,
                "size": 106694,
                "hash": ""
            },
            "Book Exports/Peter C. Brown, Henry L. Roediger III, Mark A. McDaniel - Make It Stick - The Science of Successful Learning.mrexpt": {
                "mtime": 1646595468170,
                "size": 157617,
                "hash": ""
            },
            "Learning/Learning.md": {
                "mtime": 1694272589152,
                "size": 466,
                "hash": "9b1367e3a4cd2295d734ccb45c7d5aed205cdbc8f90e59d682336f95edb905f5"
            },
            "Memory - A Very Short Introduction/Annotations.md": {
                "mtime": 1702557729735,
                "size": 43043,
                "hash": "a66de79706b655015117cb80d2184add3b8f55292f00113531e6d407ae4f5fd7"
            },
            "Memory - A Very Short Introduction/Flashcards.md": {
                "mtime": 1765097962411,
                "size": 5751,
                "hash": "13525d8c79f7de8e26268e59ada0c8179eccb5855144f660209ca3a5ea60cccb"
            },
            "Untitled - Flashcards.md": {
                "mtime": 1765098928573,
                "size": 327,
                "hash": "66ff4e075296545ed04d60ec645b8675328c5ab15448210f0cfe0a7140773a2f"
            },
            "Untitled.md": {
                "mtime": 1730069201759,
                "size": 261,
                "hash": "d8bc1db5bf0b70258fcad87b5558e5b64815e9312abe2430d8b2181969ce0a92"
            },
            "transactions.ledger": {
                "mtime": 1691029499884,
                "size": 1873,
                "hash": ""
            }
        },

        metadataCache:
        {
            "13525d8c79f7de8e26268e59ada0c8179eccb5855144f660209ca3a5ea60cccb": {
                "tags": [
                    {
                        "tag": "#flashcards",
                        "position": {
                            "start": {
                                "line": 4,
                                "col": 0,
                                "offset": 75
                            },
                            "end": {
                                "line": 4,
                                "col": 11,
                                "offset": 86
                            }
                        }
                    }
                ],
                "sections": [
                    {
                        "type": "yaml",
                        "position": {
                            "start": {
                                "line": 0,
                                "col": 0,
                                "offset": 0
                            },
                            "end": {
                                "line": 2,
                                "col": 3,
                                "offset": 73
                            }
                        }
                    },
                    {
                        "type": "paragraph",
                        "position": {
                            "start": {
                                "line": 4,
                                "col": 0,
                                "offset": 75
                            },
                            "end": {
                                "line": 4,
                                "col": 11,
                                "offset": 86
                            }
                        }
                    },
                    {
                        "type": "paragraph",
                        "position": {
                            "start": {
                                "line": 7,
                                "col": 0,
                                "offset": 89
                            },
                            "end": {
                                "line": 9,
                                "col": 66,
                                "offset": 178
                            }
                        }
                    },
                    {
                        "type": "html",
                        "position": {
                            "start": {
                                "line": 10,
                                "col": 0,
                                "offset": 179
                            },
                            "end": {
                                "line": 10,
                                "col": 34,
                                "offset": 213
                            }
                        }
                    },
                    {
                        "type": "paragraph",
                        "position": {
                            "start": {
                                "line": 12,
                                "col": 0,
                                "offset": 215
                            },
                            "end": {
                                "line": 14,
                                "col": 25,
                                "offset": 301
                            }
                        }
                    },
                    {
                        "type": "html",
                        "position": {
                            "start": {
                                "line": 15,
                                "col": 0,
                                "offset": 302
                            },
                            "end": {
                                "line": 15,
                                "col": 35,
                                "offset": 337
                            }
                        }
                    },
                    {
                        "type": "paragraph",
                        "position": {
                            "start": {
                                "line": 17,
                                "col": 0,
                                "offset": 339
                            },
                            "end": {
                                "line": 19,
                                "col": 25,
                                "offset": 431
                            }
                        }
                    },
                    {
                        "type": "html",
                        "position": {
                            "start": {
                                "line": 20,
                                "col": 0,
                                "offset": 432
                            },
                            "end": {
                                "line": 20,
                                "col": 34,
                                "offset": 466
                            }
                        }
                    },
                    {
                        "type": "paragraph",
                        "position": {
                            "start": {
                                "line": 22,
                                "col": 0,
                                "offset": 468
                            },
                            "end": {
                                "line": 24,
                                "col": 79,
                                "offset": 629
                            }
                        }
                    },
                    {
                        "type": "html",
                        "position": {
                            "start": {
                                "line": 25,
                                "col": 0,
                                "offset": 630
                            },
                            "end": {
                                "line": 25,
                                "col": 35,
                                "offset": 665
                            }
                        }
                    },
                    {
                        "type": "paragraph",
                        "position": {
                            "start": {
                                "line": 27,
                                "col": 0,
                                "offset": 667
                            },
                            "end": {
                                "line": 29,
                                "col": 140,
                                "offset": 867
                            }
                        }
                    },
                    {
                        "type": "html",
                        "position": {
                            "start": {
                                "line": 30,
                                "col": 0,
                                "offset": 868
                            },
                            "end": {
                                "line": 30,
                                "col": 34,
                                "offset": 902
                            }
                        }
                    },
                    {
                        "type": "paragraph",
                        "position": {
                            "start": {
                                "line": 32,
                                "col": 0,
                                "offset": 904
                            },
                            "end": {
                                "line": 34,
                                "col": 126,
                                "offset": 1062
                            }
                        }
                    },
                    {
                        "type": "html",
                        "position": {
                            "start": {
                                "line": 35,
                                "col": 0,
                                "offset": 1063
                            },
                            "end": {
                                "line": 35,
                                "col": 34,
                                "offset": 1097
                            }
                        }
                    },
                    {
                        "type": "paragraph",
                        "position": {
                            "start": {
                                "line": 37,
                                "col": 0,
                                "offset": 1099
                            },
                            "end": {
                                "line": 39,
                                "col": 5,
                                "offset": 1175
                            }
                        }
                    },
                    {
                        "type": "html",
                        "position": {
                            "start": {
                                "line": 40,
                                "col": 0,
                                "offset": 1176
                            },
                            "end": {
                                "line": 40,
                                "col": 35,
                                "offset": 1211
                            }
                        }
                    },
                    {
                        "type": "paragraph",
                        "position": {
                            "start": {
                                "line": 42,
                                "col": 0,
                                "offset": 1213
                            },
                            "end": {
                                "line": 44,
                                "col": 31,
                                "offset": 1307
                            }
                        }
                    },
                    {
                        "type": "html",
                        "position": {
                            "start": {
                                "line": 45,
                                "col": 0,
                                "offset": 1308
                            },
                            "end": {
                                "line": 45,
                                "col": 35,
                                "offset": 1343
                            }
                        }
                    },
                    {
                        "type": "paragraph",
                        "position": {
                            "start": {
                                "line": 47,
                                "col": 0,
                                "offset": 1345
                            },
                            "end": {
                                "line": 49,
                                "col": 50,
                                "offset": 1488
                            }
                        }
                    },
                    {
                        "type": "html",
                        "position": {
                            "start": {
                                "line": 50,
                                "col": 0,
                                "offset": 1489
                            },
                            "end": {
                                "line": 50,
                                "col": 34,
                                "offset": 1523
                            }
                        }
                    },
                    {
                        "type": "paragraph",
                        "position": {
                            "start": {
                                "line": 52,
                                "col": 0,
                                "offset": 1525
                            },
                            "end": {
                                "line": 54,
                                "col": 17,
                                "offset": 1594
                            }
                        }
                    },
                    {
                        "type": "html",
                        "position": {
                            "start": {
                                "line": 55,
                                "col": 0,
                                "offset": 1595
                            },
                            "end": {
                                "line": 55,
                                "col": 35,
                                "offset": 1630
                            }
                        }
                    },
                    {
                        "type": "paragraph",
                        "position": {
                            "start": {
                                "line": 57,
                                "col": 0,
                                "offset": 1632
                            },
                            "end": {
                                "line": 59,
                                "col": 37,
                                "offset": 1717
                            }
                        }
                    },
                    {
                        "type": "html",
                        "position": {
                            "start": {
                                "line": 60,
                                "col": 0,
                                "offset": 1718
                            },
                            "end": {
                                "line": 60,
                                "col": 35,
                                "offset": 1753
                            }
                        }
                    },
                    {
                        "type": "paragraph",
                        "position": {
                            "start": {
                                "line": 62,
                                "col": 0,
                                "offset": 1755
                            },
                            "end": {
                                "line": 64,
                                "col": 4,
                                "offset": 1818
                            }
                        }
                    },
                    {
                        "type": "html",
                        "position": {
                            "start": {
                                "line": 65,
                                "col": 0,
                                "offset": 1819
                            },
                            "end": {
                                "line": 65,
                                "col": 34,
                                "offset": 1853
                            }
                        }
                    },
                    {
                        "type": "paragraph",
                        "position": {
                            "start": {
                                "line": 67,
                                "col": 0,
                                "offset": 1855
                            },
                            "end": {
                                "line": 69,
                                "col": 71,
                                "offset": 1988
                            }
                        }
                    },
                    {
                        "type": "html",
                        "position": {
                            "start": {
                                "line": 70,
                                "col": 0,
                                "offset": 1989
                            },
                            "end": {
                                "line": 70,
                                "col": 33,
                                "offset": 2022
                            }
                        }
                    },
                    {
                        "type": "paragraph",
                        "position": {
                            "start": {
                                "line": 72,
                                "col": 0,
                                "offset": 2024
                            },
                            "end": {
                                "line": 74,
                                "col": 13,
                                "offset": 2099
                            }
                        }
                    },
                    {
                        "type": "html",
                        "position": {
                            "start": {
                                "line": 75,
                                "col": 0,
                                "offset": 2100
                            },
                            "end": {
                                "line": 75,
                                "col": 35,
                                "offset": 2135
                            }
                        }
                    },
                    {
                        "type": "paragraph",
                        "position": {
                            "start": {
                                "line": 77,
                                "col": 0,
                                "offset": 2137
                            },
                            "end": {
                                "line": 79,
                                "col": 15,
                                "offset": 2222
                            }
                        }
                    },
                    {
                        "type": "html",
                        "position": {
                            "start": {
                                "line": 80,
                                "col": 0,
                                "offset": 2223
                            },
                            "end": {
                                "line": 80,
                                "col": 33,
                                "offset": 2256
                            }
                        }
                    },
                    {
                        "type": "paragraph",
                        "position": {
                            "start": {
                                "line": 82,
                                "col": 0,
                                "offset": 2258
                            },
                            "end": {
                                "line": 84,
                                "col": 5,
                                "offset": 2305
                            }
                        }
                    },
                    {
                        "type": "html",
                        "position": {
                            "start": {
                                "line": 85,
                                "col": 0,
                                "offset": 2306
                            },
                            "end": {
                                "line": 85,
                                "col": 34,
                                "offset": 2340
                            }
                        }
                    },
                    {
                        "type": "paragraph",
                        "position": {
                            "start": {
                                "line": 87,
                                "col": 0,
                                "offset": 2342
                            },
                            "end": {
                                "line": 89,
                                "col": 37,
                                "offset": 2460
                            }
                        }
                    },
                    {
                        "type": "html",
                        "position": {
                            "start": {
                                "line": 90,
                                "col": 0,
                                "offset": 2461
                            },
                            "end": {
                                "line": 90,
                                "col": 34,
                                "offset": 2495
                            }
                        }
                    },
                    {
                        "type": "paragraph",
                        "position": {
                            "start": {
                                "line": 92,
                                "col": 0,
                                "offset": 2497
                            },
                            "end": {
                                "line": 94,
                                "col": 69,
                                "offset": 2618
                            }
                        }
                    },
                    {
                        "type": "html",
                        "position": {
                            "start": {
                                "line": 95,
                                "col": 0,
                                "offset": 2619
                            },
                            "end": {
                                "line": 95,
                                "col": 34,
                                "offset": 2653
                            }
                        }
                    },
                    {
                        "type": "paragraph",
                        "position": {
                            "start": {
                                "line": 97,
                                "col": 0,
                                "offset": 2655
                            },
                            "end": {
                                "line": 99,
                                "col": 4,
                                "offset": 2763
                            }
                        }
                    },
                    {
                        "type": "html",
                        "position": {
                            "start": {
                                "line": 100,
                                "col": 0,
                                "offset": 2764
                            },
                            "end": {
                                "line": 100,
                                "col": 34,
                                "offset": 2798
                            }
                        }
                    },
                    {
                        "type": "paragraph",
                        "position": {
                            "start": {
                                "line": 102,
                                "col": 0,
                                "offset": 2800
                            },
                            "end": {
                                "line": 104,
                                "col": 61,
                                "offset": 2928
                            }
                        }
                    },
                    {
                        "type": "html",
                        "position": {
                            "start": {
                                "line": 105,
                                "col": 0,
                                "offset": 2929
                            },
                            "end": {
                                "line": 105,
                                "col": 33,
                                "offset": 2962
                            }
                        }
                    },
                    {
                        "type": "paragraph",
                        "position": {
                            "start": {
                                "line": 107,
                                "col": 0,
                                "offset": 2964
                            },
                            "end": {
                                "line": 109,
                                "col": 125,
                                "offset": 3170
                            }
                        }
                    },
                    {
                        "type": "html",
                        "position": {
                            "start": {
                                "line": 110,
                                "col": 0,
                                "offset": 3171
                            },
                            "end": {
                                "line": 110,
                                "col": 34,
                                "offset": 3205
                            }
                        }
                    },
                    {
                        "type": "paragraph",
                        "position": {
                            "start": {
                                "line": 112,
                                "col": 0,
                                "offset": 3207
                            },
                            "end": {
                                "line": 114,
                                "col": 30,
                                "offset": 3439
                            }
                        }
                    },
                    {
                        "type": "html",
                        "position": {
                            "start": {
                                "line": 115,
                                "col": 0,
                                "offset": 3440
                            },
                            "end": {
                                "line": 115,
                                "col": 35,
                                "offset": 3475
                            }
                        }
                    },
                    {
                        "type": "paragraph",
                        "position": {
                            "start": {
                                "line": 117,
                                "col": 0,
                                "offset": 3477
                            },
                            "end": {
                                "line": 119,
                                "col": 87,
                                "offset": 3587
                            }
                        }
                    },
                    {
                        "type": "html",
                        "position": {
                            "start": {
                                "line": 120,
                                "col": 0,
                                "offset": 3588
                            },
                            "end": {
                                "line": 120,
                                "col": 34,
                                "offset": 3622
                            }
                        }
                    },
                    {
                        "type": "paragraph",
                        "position": {
                            "start": {
                                "line": 122,
                                "col": 0,
                                "offset": 3624
                            },
                            "end": {
                                "line": 124,
                                "col": 11,
                                "offset": 3699
                            }
                        }
                    },
                    {
                        "type": "html",
                        "position": {
                            "start": {
                                "line": 125,
                                "col": 0,
                                "offset": 3700
                            },
                            "end": {
                                "line": 125,
                                "col": 34,
                                "offset": 3734
                            }
                        }
                    },
                    {
                        "type": "paragraph",
                        "position": {
                            "start": {
                                "line": 127,
                                "col": 0,
                                "offset": 3736
                            },
                            "end": {
                                "line": 129,
                                "col": 28,
                                "offset": 3866
                            }
                        }
                    },
                    {
                        "type": "html",
                        "position": {
                            "start": {
                                "line": 130,
                                "col": 0,
                                "offset": 3867
                            },
                            "end": {
                                "line": 130,
                                "col": 34,
                                "offset": 3901
                            }
                        }
                    },
                    {
                        "type": "paragraph",
                        "position": {
                            "start": {
                                "line": 132,
                                "col": 0,
                                "offset": 3903
                            },
                            "end": {
                                "line": 134,
                                "col": 68,
                                "offset": 4035
                            }
                        }
                    },
                    {
                        "type": "html",
                        "position": {
                            "start": {
                                "line": 135,
                                "col": 0,
                                "offset": 4036
                            },
                            "end": {
                                "line": 135,
                                "col": 34,
                                "offset": 4070
                            }
                        }
                    },
                    {
                        "type": "paragraph",
                        "position": {
                            "start": {
                                "line": 137,
                                "col": 0,
                                "offset": 4072
                            },
                            "end": {
                                "line": 139,
                                "col": 81,
                                "offset": 4216
                            }
                        }
                    },
                    {
                        "type": "html",
                        "position": {
                            "start": {
                                "line": 140,
                                "col": 0,
                                "offset": 4217
                            },
                            "end": {
                                "line": 140,
                                "col": 34,
                                "offset": 4251
                            }
                        }
                    },
                    {
                        "type": "paragraph",
                        "position": {
                            "start": {
                                "line": 142,
                                "col": 0,
                                "offset": 4253
                            },
                            "end": {
                                "line": 144,
                                "col": 61,
                                "offset": 4406
                            }
                        }
                    },
                    {
                        "type": "html",
                        "position": {
                            "start": {
                                "line": 145,
                                "col": 0,
                                "offset": 4407
                            },
                            "end": {
                                "line": 145,
                                "col": 33,
                                "offset": 4440
                            }
                        }
                    },
                    {
                        "type": "paragraph",
                        "position": {
                            "start": {
                                "line": 147,
                                "col": 0,
                                "offset": 4442
                            },
                            "end": {
                                "line": 149,
                                "col": 15,
                                "offset": 4556
                            }
                        }
                    },
                    {
                        "type": "html",
                        "position": {
                            "start": {
                                "line": 150,
                                "col": 0,
                                "offset": 4557
                            },
                            "end": {
                                "line": 150,
                                "col": 33,
                                "offset": 4590
                            }
                        }
                    },
                    {
                        "type": "paragraph",
                        "position": {
                            "start": {
                                "line": 152,
                                "col": 0,
                                "offset": 4592
                            },
                            "end": {
                                "line": 154,
                                "col": 74,
                                "offset": 4757
                            }
                        }
                    },
                    {
                        "type": "html",
                        "position": {
                            "start": {
                                "line": 155,
                                "col": 0,
                                "offset": 4758
                            },
                            "end": {
                                "line": 155,
                                "col": 33,
                                "offset": 4791
                            }
                        }
                    },
                    {
                        "type": "paragraph",
                        "position": {
                            "start": {
                                "line": 157,
                                "col": 0,
                                "offset": 4793
                            },
                            "end": {
                                "line": 159,
                                "col": 54,
                                "offset": 4916
                            }
                        }
                    },
                    {
                        "type": "html",
                        "position": {
                            "start": {
                                "line": 160,
                                "col": 0,
                                "offset": 4917
                            },
                            "end": {
                                "line": 160,
                                "col": 34,
                                "offset": 4951
                            }
                        }
                    },
                    {
                        "type": "paragraph",
                        "position": {
                            "start": {
                                "line": 162,
                                "col": 0,
                                "offset": 4953
                            },
                            "end": {
                                "line": 164,
                                "col": 88,
                                "offset": 5141
                            }
                        }
                    },
                    {
                        "type": "html",
                        "position": {
                            "start": {
                                "line": 165,
                                "col": 0,
                                "offset": 5142
                            },
                            "end": {
                                "line": 165,
                                "col": 33,
                                "offset": 5175
                            }
                        }
                    },
                    {
                        "type": "paragraph",
                        "position": {
                            "start": {
                                "line": 167,
                                "col": 0,
                                "offset": 5177
                            },
                            "end": {
                                "line": 169,
                                "col": 74,
                                "offset": 5329
                            }
                        }
                    },
                    {
                        "type": "html",
                        "position": {
                            "start": {
                                "line": 170,
                                "col": 0,
                                "offset": 5330
                            },
                            "end": {
                                "line": 170,
                                "col": 33,
                                "offset": 5363
                            }
                        }
                    },
                    {
                        "type": "paragraph",
                        "position": {
                            "start": {
                                "line": 172,
                                "col": 0,
                                "offset": 5365
                            },
                            "end": {
                                "line": 174,
                                "col": 94,
                                "offset": 5500
                            }
                        }
                    },
                    {
                        "type": "html",
                        "position": {
                            "start": {
                                "line": 175,
                                "col": 0,
                                "offset": 5501
                            },
                            "end": {
                                "line": 175,
                                "col": 33,
                                "offset": 5534
                            }
                        }
                    },
                    {
                        "type": "paragraph",
                        "position": {
                            "start": {
                                "line": 177,
                                "col": 0,
                                "offset": 5536
                            },
                            "end": {
                                "line": 179,
                                "col": 38,
                                "offset": 5616
                            }
                        }
                    },
                    {
                        "type": "html",
                        "position": {
                            "start": {
                                "line": 180,
                                "col": 0,
                                "offset": 5617
                            },
                            "end": {
                                "line": 180,
                                "col": 33,
                                "offset": 5650
                            }
                        }
                    },
                    {
                        "type": "paragraph",
                        "position": {
                            "start": {
                                "line": 182,
                                "col": 0,
                                "offset": 5652
                            },
                            "end": {
                                "line": 184,
                                "col": 52,
                                "offset": 5733
                            }
                        }
                    },
                    {
                        "type": "html",
                        "position": {
                            "start": {
                                "line": 185,
                                "col": 0,
                                "offset": 5734
                            },
                            "end": {
                                "line": 185,
                                "col": 14,
                                "offset": 5748
                            }
                        }
                    }
                ],
                "frontmatter": {
                    "annotations": "[[Memory - A Very Short Introduction/Annotations]]"
                },
                "frontmatterLinks": [
                    {
                        "key": "annotations",
                        "link": "Memory - A Very Short Introduction/Annotations",
                        "original": "[[Memory - A Very Short Introduction/Annotations]]",
                        "displayText": "Memory - A Very Short Introduction/Annotations"
                    }
                ],
                "v": 1,
                "frontmatterPosition": {
                    "start": {
                        "line": 0,
                        "col": 0,
                        "offset": 0
                    },
                    "end": {
                        "line": 2,
                        "col": 3,
                        "offset": 73
                    }
                }
            },
            "58b48c275a2bb48fbdf058ce2f1ae4d64bdff04de5e1e9ee30618cb846d827e0": {
                "tags": [
                    {
                        "tag": "#research",
                        "position": {
                            "start": {
                                "line": 40,
                                "col": 2,
                                "offset": 1376
                            },
                            "end": {
                                "line": 40,
                                "col": 11,
                                "offset": 1385
                            }
                        }
                    }
                ],
                "headings": [
                    {
                        "heading": "Introduction",
                        "level": 1,
                        "position": {
                            "start": {
                                "line": 11,
                                "col": 0,
                                "offset": 425
                            },
                            "end": {
                                "line": 11,
                                "col": 14,
                                "offset": 439
                            }
                        }
                    },
                    {
                        "heading": "1% BETTER EVERY DAY",
                        "level": 2,
                        "position": {
                            "start": {
                                "line": 24,
                                "col": 0,
                                "offset": 760
                            },
                            "end": {
                                "line": 24,
                                "col": 22,
                                "offset": 782
                            }
                        }
                    },
                    {
                        "heading": "WHY SMALL HABITS MAKE A BIG DIFFERENCE",
                        "level": 2,
                        "position": {
                            "start": {
                                "line": 26,
                                "col": 0,
                                "offset": 784
                            },
                            "end": {
                                "line": 26,
                                "col": 41,
                                "offset": 825
                            }
                        }
                    },
                    {
                        "heading": "THE PLATEAU OF LATENT POTENTIAL",
                        "level": 2,
                        "position": {
                            "start": {
                                "line": 33,
                                "col": 0,
                                "offset": 1012
                            },
                            "end": {
                                "line": 33,
                                "col": 34,
                                "offset": 1046
                            }
                        }
                    },
                    {
                        "heading": "FORGET ABOUT GOALS, FOCUS ON SYSTEMS INSTEAD",
                        "level": 2,
                        "position": {
                            "start": {
                                "line": 35,
                                "col": 0,
                                "offset": 1048
                            },
                            "end": {
                                "line": 35,
                                "col": 47,
                                "offset": 1095
                            }
                        }
                    },
                    {
                        "heading": "A SYSTEM OF ATOMIC HABITS",
                        "level": 2,
                        "position": {
                            "start": {
                                "line": 57,
                                "col": 0,
                                "offset": 1626
                            },
                            "end": {
                                "line": 57,
                                "col": 28,
                                "offset": 1654
                            }
                        }
                    },
                    {
                        "heading": "2: How Your Habits Shape Your Identity (and Vice Versa)",
                        "level": 1,
                        "position": {
                            "start": {
                                "line": 59,
                                "col": 0,
                                "offset": 1656
                            },
                            "end": {
                                "line": 59,
                                "col": 57,
                                "offset": 1713
                            }
                        }
                    },
                    {
                        "heading": "THREE LAYERS OF BEHAVIOR CHANGE",
                        "level": 2,
                        "position": {
                            "start": {
                                "line": 61,
                                "col": 0,
                                "offset": 1715
                            },
                            "end": {
                                "line": 61,
                                "col": 34,
                                "offset": 1749
                            }
                        }
                    }
                ],
                "sections": [
                    {
                        "type": "yaml",
                        "position": {
                            "start": {
                                "line": 0,
                                "col": 0,
                                "offset": 0
                            },
                            "end": {
                                "line": 8,
                                "col": 3,
                                "offset": 422
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 11,
                                "col": 0,
                                "offset": 425
                            },
                            "end": {
                                "line": 11,
                                "col": 14,
                                "offset": 439
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 13,
                                "col": 0,
                                "offset": 441
                            },
                            "end": {
                                "line": 17,
                                "col": 2,
                                "offset": 567
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 19,
                                "col": 0,
                                "offset": 569
                            },
                            "end": {
                                "line": 22,
                                "col": 2,
                                "offset": 758
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 24,
                                "col": 0,
                                "offset": 760
                            },
                            "end": {
                                "line": 24,
                                "col": 22,
                                "offset": 782
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 26,
                                "col": 0,
                                "offset": 784
                            },
                            "end": {
                                "line": 26,
                                "col": 41,
                                "offset": 825
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 28,
                                "col": 0,
                                "offset": 827
                            },
                            "end": {
                                "line": 31,
                                "col": 2,
                                "offset": 1010
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 33,
                                "col": 0,
                                "offset": 1012
                            },
                            "end": {
                                "line": 33,
                                "col": 34,
                                "offset": 1046
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 35,
                                "col": 0,
                                "offset": 1048
                            },
                            "end": {
                                "line": 35,
                                "col": 47,
                                "offset": 1095
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 37,
                                "col": 0,
                                "offset": 1097
                            },
                            "end": {
                                "line": 40,
                                "col": 11,
                                "offset": 1385
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 42,
                                "col": 0,
                                "offset": 1387
                            },
                            "end": {
                                "line": 45,
                                "col": 2,
                                "offset": 1466
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 47,
                                "col": 0,
                                "offset": 1468
                            },
                            "end": {
                                "line": 50,
                                "col": 2,
                                "offset": 1552
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 52,
                                "col": 0,
                                "offset": 1554
                            },
                            "end": {
                                "line": 55,
                                "col": 2,
                                "offset": 1624
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 57,
                                "col": 0,
                                "offset": 1626
                            },
                            "end": {
                                "line": 57,
                                "col": 28,
                                "offset": 1654
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 59,
                                "col": 0,
                                "offset": 1656
                            },
                            "end": {
                                "line": 59,
                                "col": 57,
                                "offset": 1713
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 61,
                                "col": 0,
                                "offset": 1715
                            },
                            "end": {
                                "line": 61,
                                "col": 34,
                                "offset": 1749
                            }
                        }
                    }
                ],
                "frontmatter": {
                    "path": "Book Exports/Clear, James - Atomic habits_ an easy & proven way to build good habits & break bad ones (2018, Penguin Publishing Group_Avery) - libgen.li.mrexpt",
                    "title": " Clear, James - Atomic habits_ an easy & proven way to build good habits & break bad ones (2018, Penguin Publishing Group_Avery) - libgen.li.epub",
                    "author": null,
                    "lastExportedTimestamp": 1693031566934,
                    "lastExportedID": 15567,
                    "tags": [
                        "review/book"
                    ]
                },
                "frontmatterLinks": [],
                "v": 1,
                "frontmatterPosition": {
                    "start": {
                        "line": 0,
                        "col": 0,
                        "offset": 0
                    },
                    "end": {
                        "line": 8,
                        "col": 3,
                        "offset": 422
                    }
                }
            },
            "9b1367e3a4cd2295d734ccb45c7d5aed205cdbc8f90e59d682336f95edb905f5": {
                "headings": [
                    {
                        "heading": "Chapter 7 : Surely there is more to learning than that?",
                        "level": 1,
                        "position": {
                            "start": {
                                "line": 9,
                                "col": 0,
                                "offset": 224
                            },
                            "end": {
                                "line": 9,
                                "col": 57,
                                "offset": 281
                            }
                        }
                    },
                    {
                        "heading": "Follow the instructions",
                        "level": 2,
                        "position": {
                            "start": {
                                "line": 11,
                                "col": 0,
                                "offset": 283
                            },
                            "end": {
                                "line": 11,
                                "col": 26,
                                "offset": 309
                            }
                        }
                    }
                ],
                "sections": [
                    {
                        "type": "yaml",
                        "position": {
                            "start": {
                                "line": 0,
                                "col": 0,
                                "offset": 0
                            },
                            "end": {
                                "line": 7,
                                "col": 3,
                                "offset": 222
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 9,
                                "col": 0,
                                "offset": 224
                            },
                            "end": {
                                "line": 9,
                                "col": 57,
                                "offset": 281
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 11,
                                "col": 0,
                                "offset": 283
                            },
                            "end": {
                                "line": 11,
                                "col": 26,
                                "offset": 309
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 13,
                                "col": 0,
                                "offset": 311
                            },
                            "end": {
                                "line": 16,
                                "col": 2,
                                "offset": 464
                            }
                        }
                    }
                ],
                "frontmatter": {
                    "path": "Book Exports/Learning A Very Short Introduction by Mark Haselgrove.mrexpt",
                    "title": "Learning: A Very Short Introduction",
                    "author": null,
                    "lastExportedTimestamp": 1669301184303,
                    "lastExportedID": 13294,
                    "tags": "review/book"
                },
                "frontmatterLinks": [],
                "v": 1,
                "frontmatterPosition": {
                    "start": {
                        "line": 0,
                        "col": 0,
                        "offset": 0
                    },
                    "end": {
                        "line": 7,
                        "col": 3,
                        "offset": 222
                    }
                }
            },
            "a66de79706b655015117cb80d2184add3b8f55292f00113531e6d407ae4f5fd7": {
                "links": [
                    {
                        "link": "Ali Abdaal",
                        "original": "[[Ali Abdaal]]",
                        "displayText": "Ali Abdaal",
                        "position": {
                            "start": {
                                "line": 163,
                                "col": 62,
                                "offset": 6938
                            },
                            "end": {
                                "line": 163,
                                "col": 76,
                                "offset": 6952
                            }
                        }
                    }
                ],
                "headings": [
                    {
                        "heading": "Chapter 1: You are your memory",
                        "level": 1,
                        "position": {
                            "start": {
                                "line": 10,
                                "col": 0,
                                "offset": 253
                            },
                            "end": {
                                "line": 10,
                                "col": 32,
                                "offset": 285
                            }
                        }
                    },
                    {
                        "heading": "Chapter 2: Mapping memories",
                        "level": 1,
                        "position": {
                            "start": {
                                "line": 57,
                                "col": 0,
                                "offset": 3164
                            },
                            "end": {
                                "line": 57,
                                "col": 29,
                                "offset": 3193
                            }
                        }
                    },
                    {
                        "heading": "The logic of memory: encoding, storage, and retrieval",
                        "level": 2,
                        "position": {
                            "start": {
                                "line": 64,
                                "col": 0,
                                "offset": 3590
                            },
                            "end": {
                                "line": 64,
                                "col": 56,
                                "offset": 3646
                            }
                        }
                    },
                    {
                        "heading": "Different kinds of memory: the functional structure of remembering",
                        "level": 2,
                        "position": {
                            "start": {
                                "line": 76,
                                "col": 0,
                                "offset": 4016
                            },
                            "end": {
                                "line": 76,
                                "col": 69,
                                "offset": 4085
                            }
                        }
                    },
                    {
                        "heading": "Semantic, episodic, and procedural memory",
                        "level": 2,
                        "position": {
                            "start": {
                                "line": 230,
                                "col": 0,
                                "offset": 9167
                            },
                            "end": {
                                "line": 230,
                                "col": 44,
                                "offset": 9211
                            }
                        }
                    },
                    {
                        "heading": "Explicit and implicit memory",
                        "level": 2,
                        "position": {
                            "start": {
                                "line": 267,
                                "col": 0,
                                "offset": 10622
                            },
                            "end": {
                                "line": 267,
                                "col": 31,
                                "offset": 10653
                            }
                        }
                    },
                    {
                        "heading": "Different kinds of memory task:",
                        "level": 2,
                        "position": {
                            "start": {
                                "line": 279,
                                "col": 0,
                                "offset": 11086
                            },
                            "end": {
                                "line": 279,
                                "col": 36,
                                "offset": 11122
                            }
                        }
                    },
                    {
                        "heading": "The experience of memory",
                        "level": 2,
                        "position": {
                            "start": {
                                "line": 301,
                                "col": 0,
                                "offset": 11900
                            },
                            "end": {
                                "line": 301,
                                "col": 27,
                                "offset": 11927
                            }
                        }
                    },
                    {
                        "heading": "Levels of processing",
                        "level": 2,
                        "position": {
                            "start": {
                                "line": 313,
                                "col": 0,
                                "offset": 12187
                            },
                            "end": {
                                "line": 313,
                                "col": 23,
                                "offset": 12210
                            }
                        }
                    },
                    {
                        "heading": "Chapter 3: Pulling the rabbit out of the hat",
                        "level": 1,
                        "position": {
                            "start": {
                                "line": 325,
                                "col": 0,
                                "offset": 12777
                            },
                            "end": {
                                "line": 325,
                                "col": 46,
                                "offset": 12823
                            }
                        }
                    },
                    {
                        "heading": "Inferring memory from behaviour",
                        "level": 2,
                        "position": {
                            "start": {
                                "line": 337,
                                "col": 0,
                                "offset": 13240
                            },
                            "end": {
                                "line": 337,
                                "col": 34,
                                "offset": 13274
                            }
                        }
                    },
                    {
                        "heading": "Retrieval: recall versus recognition",
                        "level": 2,
                        "position": {
                            "start": {
                                "line": 344,
                                "col": 0,
                                "offset": 13545
                            },
                            "end": {
                                "line": 344,
                                "col": 39,
                                "offset": 13584
                            }
                        }
                    },
                    {
                        "heading": "Context retrieval",
                        "level": 3,
                        "position": {
                            "start": {
                                "line": 371,
                                "col": 0,
                                "offset": 14370
                            },
                            "end": {
                                "line": 371,
                                "col": 21,
                                "offset": 14391
                            }
                        }
                    },
                    {
                        "heading": "Familiarity",
                        "level": 3,
                        "position": {
                            "start": {
                                "line": 383,
                                "col": 0,
                                "offset": 14614
                            },
                            "end": {
                                "line": 383,
                                "col": 15,
                                "offset": 14629
                            }
                        }
                    },
                    {
                        "heading": "The effect of context on recall and recognition",
                        "level": 2,
                        "position": {
                            "start": {
                                "line": 395,
                                "col": 0,
                                "offset": 14980
                            },
                            "end": {
                                "line": 395,
                                "col": 50,
                                "offset": 15030
                            }
                        }
                    },
                    {
                        "heading": "Unconscious influences on memory",
                        "level": 2,
                        "position": {
                            "start": {
                                "line": 417,
                                "col": 0,
                                "offset": 15721
                            },
                            "end": {
                                "line": 417,
                                "col": 35,
                                "offset": 15756
                            }
                        }
                    },
                    {
                        "heading": "Categories versus continuum?",
                        "level": 2,
                        "position": {
                            "start": {
                                "line": 424,
                                "col": 0,
                                "offset": 15889
                            },
                            "end": {
                                "line": 424,
                                "col": 31,
                                "offset": 15920
                            }
                        }
                    },
                    {
                        "heading": "Relating study and test",
                        "level": 2,
                        "position": {
                            "start": {
                                "line": 456,
                                "col": 0,
                                "offset": 16962
                            },
                            "end": {
                                "line": 456,
                                "col": 26,
                                "offset": 16988
                            }
                        }
                    },
                    {
                        "heading": "Chapter 4: Inaccuracies in memory",
                        "level": 1,
                        "position": {
                            "start": {
                                "line": 471,
                                "col": 0,
                                "offset": 17660
                            },
                            "end": {
                                "line": 471,
                                "col": 35,
                                "offset": 17695
                            }
                        }
                    },
                    {
                        "heading": "Forgetting",
                        "level": 2,
                        "position": {
                            "start": {
                                "line": 498,
                                "col": 0,
                                "offset": 18596
                            },
                            "end": {
                                "line": 498,
                                "col": 13,
                                "offset": 18609
                            }
                        }
                    },
                    {
                        "heading": "Flashbulb memories and the reminiscence bump",
                        "level": 2,
                        "position": {
                            "start": {
                                "line": 530,
                                "col": 0,
                                "offset": 19853
                            },
                            "end": {
                                "line": 530,
                                "col": 47,
                                "offset": 19900
                            }
                        }
                    },
                    {
                        "heading": "Organization and errors in memory",
                        "level": 2,
                        "position": {
                            "start": {
                                "line": 557,
                                "col": 0,
                                "offset": 20992
                            },
                            "end": {
                                "line": 557,
                                "col": 36,
                                "offset": 21028
                            }
                        }
                    },
                    {
                        "heading": "The effects of previous knowledge",
                        "level": 2,
                        "position": {
                            "start": {
                                "line": 579,
                                "col": 0,
                                "offset": 22027
                            },
                            "end": {
                                "line": 579,
                                "col": 36,
                                "offset": 22063
                            }
                        }
                    },
                    {
                        "heading": "Schemas – what we already know:",
                        "level": 3,
                        "position": {
                            "start": {
                                "line": 581,
                                "col": 0,
                                "offset": 22065
                            },
                            "end": {
                                "line": 581,
                                "col": 37,
                                "offset": 22102
                            }
                        }
                    },
                    {
                        "heading": "How does knowledge promote remembering?",
                        "level": 3,
                        "position": {
                            "start": {
                                "line": 658,
                                "col": 0,
                                "offset": 25018
                            },
                            "end": {
                                "line": 658,
                                "col": 43,
                                "offset": 25061
                            }
                        }
                    },
                    {
                        "heading": "How can knowledge lead to errors?",
                        "level": 3,
                        "position": {
                            "start": {
                                "line": 670,
                                "col": 0,
                                "offset": 25485
                            },
                            "end": {
                                "line": 670,
                                "col": 37,
                                "offset": 25522
                            }
                        }
                    },
                    {
                        "heading": "Real versus imagined memories",
                        "level": 2,
                        "position": {
                            "start": {
                                "line": 692,
                                "col": 0,
                                "offset": 26402
                            },
                            "end": {
                                "line": 692,
                                "col": 32,
                                "offset": 26434
                            }
                        }
                    },
                    {
                        "heading": "Reality monitoring",
                        "level": 3,
                        "position": {
                            "start": {
                                "line": 699,
                                "col": 0,
                                "offset": 26574
                            },
                            "end": {
                                "line": 699,
                                "col": 22,
                                "offset": 26596
                            }
                        }
                    },
                    {
                        "heading": "Eyewitness testimony",
                        "level": 3,
                        "position": {
                            "start": {
                                "line": 726,
                                "col": 0,
                                "offset": 27626
                            },
                            "end": {
                                "line": 726,
                                "col": 24,
                                "offset": 27650
                            }
                        }
                    },
                    {
                        "heading": "The misinformation effect",
                        "level": 2,
                        "position": {
                            "start": {
                                "line": 756,
                                "col": 0,
                                "offset": 30144
                            },
                            "end": {
                                "line": 756,
                                "col": 28,
                                "offset": 30172
                            }
                        }
                    },
                    {
                        "heading": "False memories:",
                        "level": 3,
                        "position": {
                            "start": {
                                "line": 773,
                                "col": 0,
                                "offset": 30662
                            },
                            "end": {
                                "line": 773,
                                "col": 21,
                                "offset": 30683
                            }
                        }
                    },
                    {
                        "heading": "Chapter 5: Memory impairment",
                        "level": 1,
                        "position": {
                            "start": {
                                "line": 822,
                                "col": 0,
                                "offset": 33968
                            },
                            "end": {
                                "line": 822,
                                "col": 30,
                                "offset": 33998
                            }
                        }
                    },
                    {
                        "heading": "Memory and the brain",
                        "level": 2,
                        "position": {
                            "start": {
                                "line": 824,
                                "col": 0,
                                "offset": 34000
                            },
                            "end": {
                                "line": 824,
                                "col": 23,
                                "offset": 34023
                            }
                        }
                    },
                    {
                        "heading": "Loss of memory after brain injury – the ‘amnesic syndrome’",
                        "level": 2,
                        "position": {
                            "start": {
                                "line": 836,
                                "col": 0,
                                "offset": 34543
                            },
                            "end": {
                                "line": 836,
                                "col": 61,
                                "offset": 34604
                            }
                        }
                    },
                    {
                        "heading": "Testing amnesia",
                        "level": 2,
                        "position": {
                            "start": {
                                "line": 888,
                                "col": 0,
                                "offset": 37271
                            },
                            "end": {
                                "line": 888,
                                "col": 18,
                                "offset": 37289
                            }
                        }
                    },
                    {
                        "heading": "Psychogenic amnesia",
                        "level": 2,
                        "position": {
                            "start": {
                                "line": 915,
                                "col": 0,
                                "offset": 38315
                            },
                            "end": {
                                "line": 915,
                                "col": 22,
                                "offset": 38337
                            }
                        }
                    },
                    {
                        "heading": "Chapter 6: The seven ages of man",
                        "level": 1,
                        "position": {
                            "start": {
                                "line": 922,
                                "col": 0,
                                "offset": 38634
                            },
                            "end": {
                                "line": 922,
                                "col": 34,
                                "offset": 38668
                            }
                        }
                    },
                    {
                        "heading": "Memory development",
                        "level": 2,
                        "position": {
                            "start": {
                                "line": 925,
                                "col": 0,
                                "offset": 38672
                            },
                            "end": {
                                "line": 925,
                                "col": 21,
                                "offset": 38693
                            }
                        }
                    },
                    {
                        "heading": "Memory and ageing",
                        "level": 2,
                        "position": {
                            "start": {
                                "line": 932,
                                "col": 0,
                                "offset": 38941
                            },
                            "end": {
                                "line": 932,
                                "col": 20,
                                "offset": 38961
                            }
                        }
                    },
                    {
                        "heading": "Chapter 7: Improving memory",
                        "level": 1,
                        "position": {
                            "start": {
                                "line": 979,
                                "col": 0,
                                "offset": 40761
                            },
                            "end": {
                                "line": 979,
                                "col": 29,
                                "offset": 40790
                            }
                        }
                    },
                    {
                        "heading": "Can you improve your memory?",
                        "level": 2,
                        "position": {
                            "start": {
                                "line": 981,
                                "col": 0,
                                "offset": 40792
                            },
                            "end": {
                                "line": 981,
                                "col": 31,
                                "offset": 40823
                            }
                        }
                    },
                    {
                        "heading": "The ‘hardware’",
                        "level": 3,
                        "position": {
                            "start": {
                                "line": 983,
                                "col": 0,
                                "offset": 40825
                            },
                            "end": {
                                "line": 983,
                                "col": 18,
                                "offset": 40843
                            }
                        }
                    },
                    {
                        "heading": "The ‘software",
                        "level": 3,
                        "position": {
                            "start": {
                                "line": 990,
                                "col": 0,
                                "offset": 41139
                            },
                            "end": {
                                "line": 990,
                                "col": 17,
                                "offset": 41156
                            }
                        }
                    },
                    {
                        "heading": "Rehearsal",
                        "level": 2,
                        "position": {
                            "start": {
                                "line": 992,
                                "col": 0,
                                "offset": 41158
                            },
                            "end": {
                                "line": 992,
                                "col": 12,
                                "offset": 41170
                            }
                        }
                    },
                    {
                        "heading": "Expanding retrieval practice",
                        "level": 2,
                        "position": {
                            "start": {
                                "line": 994,
                                "col": 0,
                                "offset": 41172
                            },
                            "end": {
                                "line": 994,
                                "col": 31,
                                "offset": 41203
                            }
                        }
                    },
                    {
                        "heading": "The benefits of spaced study",
                        "level": 3,
                        "position": {
                            "start": {
                                "line": 996,
                                "col": 0,
                                "offset": 41205
                            },
                            "end": {
                                "line": 996,
                                "col": 32,
                                "offset": 41237
                            }
                        }
                    },
                    {
                        "heading": "Meaning and memory",
                        "level": 2,
                        "position": {
                            "start": {
                                "line": 998,
                                "col": 0,
                                "offset": 41239
                            },
                            "end": {
                                "line": 998,
                                "col": 21,
                                "offset": 41260
                            }
                        }
                    },
                    {
                        "heading": "External aids",
                        "level": 2,
                        "position": {
                            "start": {
                                "line": 1000,
                                "col": 0,
                                "offset": 41262
                            },
                            "end": {
                                "line": 1000,
                                "col": 16,
                                "offset": 41278
                            }
                        }
                    },
                    {
                        "heading": "Mnemonics",
                        "level": 3,
                        "position": {
                            "start": {
                                "line": 1002,
                                "col": 0,
                                "offset": 41280
                            },
                            "end": {
                                "line": 1002,
                                "col": 13,
                                "offset": 41293
                            }
                        }
                    },
                    {
                        "heading": "Verbal mnemonics",
                        "level": 3,
                        "position": {
                            "start": {
                                "line": 1019,
                                "col": 0,
                                "offset": 41626
                            },
                            "end": {
                                "line": 1019,
                                "col": 20,
                                "offset": 41646
                            }
                        }
                    },
                    {
                        "heading": "Remembering names",
                        "level": 2,
                        "position": {
                            "start": {
                                "line": 1031,
                                "col": 0,
                                "offset": 42032
                            },
                            "end": {
                                "line": 1031,
                                "col": 20,
                                "offset": 42052
                            }
                        }
                    },
                    {
                        "heading": "Reflecting on our own learning",
                        "level": 2,
                        "position": {
                            "start": {
                                "line": 1038,
                                "col": 0,
                                "offset": 42373
                            },
                            "end": {
                                "line": 1038,
                                "col": 33,
                                "offset": 42406
                            }
                        }
                    },
                    {
                        "heading": "The man with a perfect memory",
                        "level": 2,
                        "position": {
                            "start": {
                                "line": 1040,
                                "col": 0,
                                "offset": 42408
                            },
                            "end": {
                                "line": 1040,
                                "col": 32,
                                "offset": 42440
                            }
                        }
                    },
                    {
                        "heading": "Final thoughts",
                        "level": 2,
                        "position": {
                            "start": {
                                "line": 1047,
                                "col": 0,
                                "offset": 42627
                            },
                            "end": {
                                "line": 1047,
                                "col": 17,
                                "offset": 42644
                            }
                        }
                    }
                ],
                "sections": [
                    {
                        "type": "yaml",
                        "position": {
                            "start": {
                                "line": 0,
                                "col": 0,
                                "offset": 0
                            },
                            "end": {
                                "line": 8,
                                "col": 3,
                                "offset": 251
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 10,
                                "col": 0,
                                "offset": 253
                            },
                            "end": {
                                "line": 10,
                                "col": 32,
                                "offset": 285
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 12,
                                "col": 0,
                                "offset": 287
                            },
                            "end": {
                                "line": 15,
                                "col": 26,
                                "offset": 370
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 17,
                                "col": 0,
                                "offset": 372
                            },
                            "end": {
                                "line": 20,
                                "col": 26,
                                "offset": 655
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 22,
                                "col": 0,
                                "offset": 657
                            },
                            "end": {
                                "line": 25,
                                "col": 2,
                                "offset": 1140
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 27,
                                "col": 0,
                                "offset": 1142
                            },
                            "end": {
                                "line": 30,
                                "col": 2,
                                "offset": 1378
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 32,
                                "col": 0,
                                "offset": 1380
                            },
                            "end": {
                                "line": 35,
                                "col": 2,
                                "offset": 1679
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 37,
                                "col": 0,
                                "offset": 1681
                            },
                            "end": {
                                "line": 40,
                                "col": 2,
                                "offset": 1874
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 42,
                                "col": 0,
                                "offset": 1876
                            },
                            "end": {
                                "line": 45,
                                "col": 2,
                                "offset": 2038
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 47,
                                "col": 0,
                                "offset": 2040
                            },
                            "end": {
                                "line": 50,
                                "col": 2,
                                "offset": 2406
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 52,
                                "col": 0,
                                "offset": 2408
                            },
                            "end": {
                                "line": 55,
                                "col": 2,
                                "offset": 3162
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 57,
                                "col": 0,
                                "offset": 3164
                            },
                            "end": {
                                "line": 57,
                                "col": 29,
                                "offset": 3193
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 59,
                                "col": 0,
                                "offset": 3195
                            },
                            "end": {
                                "line": 62,
                                "col": 2,
                                "offset": 3588
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 64,
                                "col": 0,
                                "offset": 3590
                            },
                            "end": {
                                "line": 64,
                                "col": 56,
                                "offset": 3646
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 66,
                                "col": 0,
                                "offset": 3648
                            },
                            "end": {
                                "line": 69,
                                "col": 3,
                                "offset": 3770
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 71,
                                "col": 0,
                                "offset": 3772
                            },
                            "end": {
                                "line": 74,
                                "col": 3,
                                "offset": 4014
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 76,
                                "col": 0,
                                "offset": 4016
                            },
                            "end": {
                                "line": 76,
                                "col": 69,
                                "offset": 4085
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 78,
                                "col": 0,
                                "offset": 4087
                            },
                            "end": {
                                "line": 81,
                                "col": 3,
                                "offset": 4291
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 83,
                                "col": 0,
                                "offset": 4293
                            },
                            "end": {
                                "line": 86,
                                "col": 6,
                                "offset": 4337
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 88,
                                "col": 0,
                                "offset": 4339
                            },
                            "end": {
                                "line": 91,
                                "col": 7,
                                "offset": 4565
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 93,
                                "col": 0,
                                "offset": 4567
                            },
                            "end": {
                                "line": 96,
                                "col": 3,
                                "offset": 4705
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 98,
                                "col": 0,
                                "offset": 4707
                            },
                            "end": {
                                "line": 101,
                                "col": 3,
                                "offset": 5024
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 103,
                                "col": 0,
                                "offset": 5026
                            },
                            "end": {
                                "line": 106,
                                "col": 6,
                                "offset": 5074
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 108,
                                "col": 0,
                                "offset": 5076
                            },
                            "end": {
                                "line": 111,
                                "col": 3,
                                "offset": 5278
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 113,
                                "col": 0,
                                "offset": 5280
                            },
                            "end": {
                                "line": 116,
                                "col": 3,
                                "offset": 5499
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 118,
                                "col": 0,
                                "offset": 5501
                            },
                            "end": {
                                "line": 121,
                                "col": 6,
                                "offset": 5548
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 123,
                                "col": 0,
                                "offset": 5550
                            },
                            "end": {
                                "line": 126,
                                "col": 3,
                                "offset": 5768
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 128,
                                "col": 0,
                                "offset": 5770
                            },
                            "end": {
                                "line": 131,
                                "col": 4,
                                "offset": 5914
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 133,
                                "col": 0,
                                "offset": 5916
                            },
                            "end": {
                                "line": 136,
                                "col": 4,
                                "offset": 6129
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 138,
                                "col": 0,
                                "offset": 6131
                            },
                            "end": {
                                "line": 141,
                                "col": 6,
                                "offset": 6176
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 143,
                                "col": 0,
                                "offset": 6178
                            },
                            "end": {
                                "line": 146,
                                "col": 4,
                                "offset": 6327
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 148,
                                "col": 0,
                                "offset": 6329
                            },
                            "end": {
                                "line": 151,
                                "col": 4,
                                "offset": 6479
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 153,
                                "col": 0,
                                "offset": 6481
                            },
                            "end": {
                                "line": 156,
                                "col": 4,
                                "offset": 6647
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 158,
                                "col": 0,
                                "offset": 6649
                            },
                            "end": {
                                "line": 163,
                                "col": 90,
                                "offset": 6966
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 165,
                                "col": 0,
                                "offset": 6968
                            },
                            "end": {
                                "line": 168,
                                "col": 4,
                                "offset": 7081
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 170,
                                "col": 0,
                                "offset": 7083
                            },
                            "end": {
                                "line": 173,
                                "col": 4,
                                "offset": 7541
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 175,
                                "col": 0,
                                "offset": 7543
                            },
                            "end": {
                                "line": 178,
                                "col": 7,
                                "offset": 7592
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 180,
                                "col": 0,
                                "offset": 7594
                            },
                            "end": {
                                "line": 183,
                                "col": 4,
                                "offset": 7813
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 185,
                                "col": 0,
                                "offset": 7815
                            },
                            "end": {
                                "line": 188,
                                "col": 4,
                                "offset": 7942
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 190,
                                "col": 0,
                                "offset": 7944
                            },
                            "end": {
                                "line": 193,
                                "col": 7,
                                "offset": 7999
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 195,
                                "col": 0,
                                "offset": 8001
                            },
                            "end": {
                                "line": 198,
                                "col": 4,
                                "offset": 8142
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 200,
                                "col": 0,
                                "offset": 8144
                            },
                            "end": {
                                "line": 203,
                                "col": 7,
                                "offset": 8193
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 205,
                                "col": 0,
                                "offset": 8195
                            },
                            "end": {
                                "line": 208,
                                "col": 4,
                                "offset": 8459
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 210,
                                "col": 0,
                                "offset": 8461
                            },
                            "end": {
                                "line": 213,
                                "col": 4,
                                "offset": 8806
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 215,
                                "col": 0,
                                "offset": 8808
                            },
                            "end": {
                                "line": 218,
                                "col": 7,
                                "offset": 8859
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 220,
                                "col": 0,
                                "offset": 8861
                            },
                            "end": {
                                "line": 223,
                                "col": 4,
                                "offset": 9116
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 225,
                                "col": 0,
                                "offset": 9118
                            },
                            "end": {
                                "line": 228,
                                "col": 6,
                                "offset": 9165
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 230,
                                "col": 0,
                                "offset": 9167
                            },
                            "end": {
                                "line": 230,
                                "col": 44,
                                "offset": 9211
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 232,
                                "col": 0,
                                "offset": 9213
                            },
                            "end": {
                                "line": 235,
                                "col": 2,
                                "offset": 9412
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 237,
                                "col": 0,
                                "offset": 9414
                            },
                            "end": {
                                "line": 240,
                                "col": 2,
                                "offset": 9544
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 242,
                                "col": 0,
                                "offset": 9546
                            },
                            "end": {
                                "line": 245,
                                "col": 2,
                                "offset": 9744
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 247,
                                "col": 0,
                                "offset": 9746
                            },
                            "end": {
                                "line": 250,
                                "col": 2,
                                "offset": 9992
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 252,
                                "col": 0,
                                "offset": 9994
                            },
                            "end": {
                                "line": 255,
                                "col": 2,
                                "offset": 10160
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 257,
                                "col": 0,
                                "offset": 10162
                            },
                            "end": {
                                "line": 260,
                                "col": 2,
                                "offset": 10347
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 262,
                                "col": 0,
                                "offset": 10349
                            },
                            "end": {
                                "line": 265,
                                "col": 2,
                                "offset": 10620
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 267,
                                "col": 0,
                                "offset": 10622
                            },
                            "end": {
                                "line": 267,
                                "col": 31,
                                "offset": 10653
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 269,
                                "col": 0,
                                "offset": 10655
                            },
                            "end": {
                                "line": 272,
                                "col": 2,
                                "offset": 10856
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 274,
                                "col": 0,
                                "offset": 10858
                            },
                            "end": {
                                "line": 277,
                                "col": 2,
                                "offset": 11084
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 279,
                                "col": 0,
                                "offset": 11086
                            },
                            "end": {
                                "line": 279,
                                "col": 36,
                                "offset": 11122
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 281,
                                "col": 0,
                                "offset": 11124
                            },
                            "end": {
                                "line": 284,
                                "col": 2,
                                "offset": 11274
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 286,
                                "col": 0,
                                "offset": 11276
                            },
                            "end": {
                                "line": 289,
                                "col": 2,
                                "offset": 11421
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 291,
                                "col": 0,
                                "offset": 11423
                            },
                            "end": {
                                "line": 294,
                                "col": 2,
                                "offset": 11605
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 296,
                                "col": 0,
                                "offset": 11607
                            },
                            "end": {
                                "line": 299,
                                "col": 2,
                                "offset": 11898
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 301,
                                "col": 0,
                                "offset": 11900
                            },
                            "end": {
                                "line": 301,
                                "col": 27,
                                "offset": 11927
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 303,
                                "col": 0,
                                "offset": 11929
                            },
                            "end": {
                                "line": 306,
                                "col": 2,
                                "offset": 12089
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 308,
                                "col": 0,
                                "offset": 12091
                            },
                            "end": {
                                "line": 311,
                                "col": 2,
                                "offset": 12185
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 313,
                                "col": 0,
                                "offset": 12187
                            },
                            "end": {
                                "line": 313,
                                "col": 23,
                                "offset": 12210
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 315,
                                "col": 0,
                                "offset": 12212
                            },
                            "end": {
                                "line": 318,
                                "col": 2,
                                "offset": 12391
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 320,
                                "col": 0,
                                "offset": 12393
                            },
                            "end": {
                                "line": 323,
                                "col": 2,
                                "offset": 12775
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 325,
                                "col": 0,
                                "offset": 12777
                            },
                            "end": {
                                "line": 325,
                                "col": 46,
                                "offset": 12823
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 327,
                                "col": 0,
                                "offset": 12825
                            },
                            "end": {
                                "line": 330,
                                "col": 2,
                                "offset": 12919
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 332,
                                "col": 0,
                                "offset": 12921
                            },
                            "end": {
                                "line": 335,
                                "col": 2,
                                "offset": 13238
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 337,
                                "col": 0,
                                "offset": 13240
                            },
                            "end": {
                                "line": 337,
                                "col": 34,
                                "offset": 13274
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 339,
                                "col": 0,
                                "offset": 13276
                            },
                            "end": {
                                "line": 342,
                                "col": 2,
                                "offset": 13543
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 344,
                                "col": 0,
                                "offset": 13545
                            },
                            "end": {
                                "line": 344,
                                "col": 39,
                                "offset": 13584
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 346,
                                "col": 0,
                                "offset": 13586
                            },
                            "end": {
                                "line": 349,
                                "col": 2,
                                "offset": 13700
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 351,
                                "col": 0,
                                "offset": 13702
                            },
                            "end": {
                                "line": 354,
                                "col": 2,
                                "offset": 13801
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 356,
                                "col": 0,
                                "offset": 13803
                            },
                            "end": {
                                "line": 359,
                                "col": 2,
                                "offset": 14038
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 361,
                                "col": 0,
                                "offset": 14040
                            },
                            "end": {
                                "line": 364,
                                "col": 2,
                                "offset": 14229
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 366,
                                "col": 0,
                                "offset": 14231
                            },
                            "end": {
                                "line": 369,
                                "col": 2,
                                "offset": 14368
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 371,
                                "col": 0,
                                "offset": 14370
                            },
                            "end": {
                                "line": 371,
                                "col": 21,
                                "offset": 14391
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 373,
                                "col": 0,
                                "offset": 14393
                            },
                            "end": {
                                "line": 376,
                                "col": 2,
                                "offset": 14477
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 378,
                                "col": 0,
                                "offset": 14479
                            },
                            "end": {
                                "line": 381,
                                "col": 2,
                                "offset": 14612
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 383,
                                "col": 0,
                                "offset": 14614
                            },
                            "end": {
                                "line": 383,
                                "col": 15,
                                "offset": 14629
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 385,
                                "col": 0,
                                "offset": 14631
                            },
                            "end": {
                                "line": 388,
                                "col": 2,
                                "offset": 14805
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 390,
                                "col": 0,
                                "offset": 14807
                            },
                            "end": {
                                "line": 393,
                                "col": 2,
                                "offset": 14978
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 395,
                                "col": 0,
                                "offset": 14980
                            },
                            "end": {
                                "line": 395,
                                "col": 50,
                                "offset": 15030
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 397,
                                "col": 0,
                                "offset": 15032
                            },
                            "end": {
                                "line": 400,
                                "col": 2,
                                "offset": 15262
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 402,
                                "col": 0,
                                "offset": 15264
                            },
                            "end": {
                                "line": 405,
                                "col": 2,
                                "offset": 15478
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 407,
                                "col": 0,
                                "offset": 15480
                            },
                            "end": {
                                "line": 410,
                                "col": 2,
                                "offset": 15577
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 412,
                                "col": 0,
                                "offset": 15579
                            },
                            "end": {
                                "line": 415,
                                "col": 2,
                                "offset": 15719
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 417,
                                "col": 0,
                                "offset": 15721
                            },
                            "end": {
                                "line": 417,
                                "col": 35,
                                "offset": 15756
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 419,
                                "col": 0,
                                "offset": 15758
                            },
                            "end": {
                                "line": 422,
                                "col": 2,
                                "offset": 15887
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 424,
                                "col": 0,
                                "offset": 15889
                            },
                            "end": {
                                "line": 424,
                                "col": 31,
                                "offset": 15920
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 426,
                                "col": 0,
                                "offset": 15922
                            },
                            "end": {
                                "line": 429,
                                "col": 2,
                                "offset": 16144
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 431,
                                "col": 0,
                                "offset": 16146
                            },
                            "end": {
                                "line": 434,
                                "col": 2,
                                "offset": 16331
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 436,
                                "col": 0,
                                "offset": 16333
                            },
                            "end": {
                                "line": 439,
                                "col": 2,
                                "offset": 16476
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 441,
                                "col": 0,
                                "offset": 16478
                            },
                            "end": {
                                "line": 444,
                                "col": 2,
                                "offset": 16623
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 446,
                                "col": 0,
                                "offset": 16625
                            },
                            "end": {
                                "line": 449,
                                "col": 2,
                                "offset": 16767
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 451,
                                "col": 0,
                                "offset": 16769
                            },
                            "end": {
                                "line": 454,
                                "col": 2,
                                "offset": 16960
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 456,
                                "col": 0,
                                "offset": 16962
                            },
                            "end": {
                                "line": 456,
                                "col": 26,
                                "offset": 16988
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 458,
                                "col": 0,
                                "offset": 16990
                            },
                            "end": {
                                "line": 464,
                                "col": 2,
                                "offset": 17464
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 466,
                                "col": 0,
                                "offset": 17466
                            },
                            "end": {
                                "line": 469,
                                "col": 2,
                                "offset": 17658
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 471,
                                "col": 0,
                                "offset": 17660
                            },
                            "end": {
                                "line": 471,
                                "col": 35,
                                "offset": 17695
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 473,
                                "col": 0,
                                "offset": 17697
                            },
                            "end": {
                                "line": 476,
                                "col": 2,
                                "offset": 17801
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 478,
                                "col": 0,
                                "offset": 17803
                            },
                            "end": {
                                "line": 481,
                                "col": 2,
                                "offset": 17971
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 483,
                                "col": 0,
                                "offset": 17973
                            },
                            "end": {
                                "line": 486,
                                "col": 2,
                                "offset": 18124
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 488,
                                "col": 0,
                                "offset": 18126
                            },
                            "end": {
                                "line": 491,
                                "col": 2,
                                "offset": 18364
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 493,
                                "col": 0,
                                "offset": 18366
                            },
                            "end": {
                                "line": 496,
                                "col": 2,
                                "offset": 18594
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 498,
                                "col": 0,
                                "offset": 18596
                            },
                            "end": {
                                "line": 498,
                                "col": 13,
                                "offset": 18609
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 500,
                                "col": 0,
                                "offset": 18611
                            },
                            "end": {
                                "line": 503,
                                "col": 2,
                                "offset": 18722
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 505,
                                "col": 0,
                                "offset": 18724
                            },
                            "end": {
                                "line": 508,
                                "col": 2,
                                "offset": 18797
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 510,
                                "col": 0,
                                "offset": 18799
                            },
                            "end": {
                                "line": 513,
                                "col": 2,
                                "offset": 19048
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 515,
                                "col": 0,
                                "offset": 19050
                            },
                            "end": {
                                "line": 518,
                                "col": 2,
                                "offset": 19412
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 520,
                                "col": 0,
                                "offset": 19414
                            },
                            "end": {
                                "line": 523,
                                "col": 2,
                                "offset": 19719
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 525,
                                "col": 0,
                                "offset": 19721
                            },
                            "end": {
                                "line": 528,
                                "col": 2,
                                "offset": 19851
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 530,
                                "col": 0,
                                "offset": 19853
                            },
                            "end": {
                                "line": 530,
                                "col": 47,
                                "offset": 19900
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 532,
                                "col": 0,
                                "offset": 19902
                            },
                            "end": {
                                "line": 535,
                                "col": 2,
                                "offset": 20025
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 537,
                                "col": 0,
                                "offset": 20027
                            },
                            "end": {
                                "line": 540,
                                "col": 2,
                                "offset": 20242
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 542,
                                "col": 0,
                                "offset": 20244
                            },
                            "end": {
                                "line": 545,
                                "col": 2,
                                "offset": 20540
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 547,
                                "col": 0,
                                "offset": 20542
                            },
                            "end": {
                                "line": 550,
                                "col": 2,
                                "offset": 20727
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 552,
                                "col": 0,
                                "offset": 20729
                            },
                            "end": {
                                "line": 555,
                                "col": 2,
                                "offset": 20990
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 557,
                                "col": 0,
                                "offset": 20992
                            },
                            "end": {
                                "line": 557,
                                "col": 36,
                                "offset": 21028
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 559,
                                "col": 0,
                                "offset": 21030
                            },
                            "end": {
                                "line": 562,
                                "col": 2,
                                "offset": 21472
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 564,
                                "col": 0,
                                "offset": 21474
                            },
                            "end": {
                                "line": 567,
                                "col": 2,
                                "offset": 21754
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 569,
                                "col": 0,
                                "offset": 21756
                            },
                            "end": {
                                "line": 572,
                                "col": 2,
                                "offset": 21872
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 574,
                                "col": 0,
                                "offset": 21874
                            },
                            "end": {
                                "line": 577,
                                "col": 2,
                                "offset": 22025
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 579,
                                "col": 0,
                                "offset": 22027
                            },
                            "end": {
                                "line": 579,
                                "col": 36,
                                "offset": 22063
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 581,
                                "col": 0,
                                "offset": 22065
                            },
                            "end": {
                                "line": 581,
                                "col": 37,
                                "offset": 22102
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 583,
                                "col": 0,
                                "offset": 22104
                            },
                            "end": {
                                "line": 586,
                                "col": 2,
                                "offset": 22286
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 588,
                                "col": 0,
                                "offset": 22288
                            },
                            "end": {
                                "line": 591,
                                "col": 2,
                                "offset": 22435
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 593,
                                "col": 0,
                                "offset": 22437
                            },
                            "end": {
                                "line": 596,
                                "col": 2,
                                "offset": 22678
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 598,
                                "col": 0,
                                "offset": 22680
                            },
                            "end": {
                                "line": 601,
                                "col": 2,
                                "offset": 22869
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 603,
                                "col": 0,
                                "offset": 22871
                            },
                            "end": {
                                "line": 606,
                                "col": 2,
                                "offset": 23060
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 608,
                                "col": 0,
                                "offset": 23062
                            },
                            "end": {
                                "line": 611,
                                "col": 2,
                                "offset": 23152
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 613,
                                "col": 0,
                                "offset": 23154
                            },
                            "end": {
                                "line": 616,
                                "col": 2,
                                "offset": 23244
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 618,
                                "col": 0,
                                "offset": 23246
                            },
                            "end": {
                                "line": 621,
                                "col": 2,
                                "offset": 23357
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 623,
                                "col": 0,
                                "offset": 23359
                            },
                            "end": {
                                "line": 626,
                                "col": 2,
                                "offset": 23470
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 628,
                                "col": 0,
                                "offset": 23472
                            },
                            "end": {
                                "line": 631,
                                "col": 2,
                                "offset": 23890
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 633,
                                "col": 0,
                                "offset": 23892
                            },
                            "end": {
                                "line": 636,
                                "col": 2,
                                "offset": 24310
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 638,
                                "col": 0,
                                "offset": 24312
                            },
                            "end": {
                                "line": 641,
                                "col": 2,
                                "offset": 24524
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 643,
                                "col": 0,
                                "offset": 24526
                            },
                            "end": {
                                "line": 646,
                                "col": 2,
                                "offset": 24738
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 648,
                                "col": 0,
                                "offset": 24740
                            },
                            "end": {
                                "line": 651,
                                "col": 2,
                                "offset": 24877
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 653,
                                "col": 0,
                                "offset": 24879
                            },
                            "end": {
                                "line": 656,
                                "col": 2,
                                "offset": 25016
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 658,
                                "col": 0,
                                "offset": 25018
                            },
                            "end": {
                                "line": 658,
                                "col": 43,
                                "offset": 25061
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 660,
                                "col": 0,
                                "offset": 25063
                            },
                            "end": {
                                "line": 663,
                                "col": 2,
                                "offset": 25275
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 665,
                                "col": 0,
                                "offset": 25277
                            },
                            "end": {
                                "line": 668,
                                "col": 2,
                                "offset": 25483
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 670,
                                "col": 0,
                                "offset": 25485
                            },
                            "end": {
                                "line": 670,
                                "col": 37,
                                "offset": 25522
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 672,
                                "col": 0,
                                "offset": 25524
                            },
                            "end": {
                                "line": 675,
                                "col": 2,
                                "offset": 25687
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 677,
                                "col": 0,
                                "offset": 25689
                            },
                            "end": {
                                "line": 680,
                                "col": 2,
                                "offset": 25896
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 682,
                                "col": 0,
                                "offset": 25898
                            },
                            "end": {
                                "line": 685,
                                "col": 2,
                                "offset": 26204
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 687,
                                "col": 0,
                                "offset": 26206
                            },
                            "end": {
                                "line": 690,
                                "col": 2,
                                "offset": 26400
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 692,
                                "col": 0,
                                "offset": 26402
                            },
                            "end": {
                                "line": 692,
                                "col": 32,
                                "offset": 26434
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 694,
                                "col": 0,
                                "offset": 26436
                            },
                            "end": {
                                "line": 697,
                                "col": 2,
                                "offset": 26572
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 699,
                                "col": 0,
                                "offset": 26574
                            },
                            "end": {
                                "line": 699,
                                "col": 22,
                                "offset": 26596
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 701,
                                "col": 0,
                                "offset": 26598
                            },
                            "end": {
                                "line": 704,
                                "col": 2,
                                "offset": 26807
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 706,
                                "col": 0,
                                "offset": 26809
                            },
                            "end": {
                                "line": 709,
                                "col": 2,
                                "offset": 27001
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 711,
                                "col": 0,
                                "offset": 27003
                            },
                            "end": {
                                "line": 714,
                                "col": 2,
                                "offset": 27173
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 716,
                                "col": 0,
                                "offset": 27175
                            },
                            "end": {
                                "line": 719,
                                "col": 2,
                                "offset": 27327
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 721,
                                "col": 0,
                                "offset": 27329
                            },
                            "end": {
                                "line": 724,
                                "col": 2,
                                "offset": 27624
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 726,
                                "col": 0,
                                "offset": 27626
                            },
                            "end": {
                                "line": 726,
                                "col": 24,
                                "offset": 27650
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 728,
                                "col": 0,
                                "offset": 27652
                            },
                            "end": {
                                "line": 739,
                                "col": 2,
                                "offset": 29159
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 741,
                                "col": 0,
                                "offset": 29161
                            },
                            "end": {
                                "line": 744,
                                "col": 2,
                                "offset": 29275
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 746,
                                "col": 0,
                                "offset": 29277
                            },
                            "end": {
                                "line": 749,
                                "col": 2,
                                "offset": 29801
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 751,
                                "col": 0,
                                "offset": 29803
                            },
                            "end": {
                                "line": 754,
                                "col": 2,
                                "offset": 30142
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 756,
                                "col": 0,
                                "offset": 30144
                            },
                            "end": {
                                "line": 756,
                                "col": 28,
                                "offset": 30172
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 758,
                                "col": 0,
                                "offset": 30174
                            },
                            "end": {
                                "line": 761,
                                "col": 2,
                                "offset": 30286
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 763,
                                "col": 0,
                                "offset": 30288
                            },
                            "end": {
                                "line": 766,
                                "col": 2,
                                "offset": 30460
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 768,
                                "col": 0,
                                "offset": 30462
                            },
                            "end": {
                                "line": 771,
                                "col": 2,
                                "offset": 30660
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 773,
                                "col": 0,
                                "offset": 30662
                            },
                            "end": {
                                "line": 773,
                                "col": 21,
                                "offset": 30683
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 775,
                                "col": 0,
                                "offset": 30685
                            },
                            "end": {
                                "line": 778,
                                "col": 2,
                                "offset": 30975
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 780,
                                "col": 0,
                                "offset": 30977
                            },
                            "end": {
                                "line": 783,
                                "col": 2,
                                "offset": 31212
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 785,
                                "col": 0,
                                "offset": 31214
                            },
                            "end": {
                                "line": 788,
                                "col": 2,
                                "offset": 31480
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 790,
                                "col": 0,
                                "offset": 31482
                            },
                            "end": {
                                "line": 793,
                                "col": 2,
                                "offset": 31662
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 795,
                                "col": 0,
                                "offset": 31664
                            },
                            "end": {
                                "line": 798,
                                "col": 2,
                                "offset": 31847
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 800,
                                "col": 0,
                                "offset": 31849
                            },
                            "end": {
                                "line": 803,
                                "col": 2,
                                "offset": 32027
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 805,
                                "col": 0,
                                "offset": 32029
                            },
                            "end": {
                                "line": 808,
                                "col": 2,
                                "offset": 32257
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 810,
                                "col": 0,
                                "offset": 32259
                            },
                            "end": {
                                "line": 820,
                                "col": 2,
                                "offset": 33966
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 822,
                                "col": 0,
                                "offset": 33968
                            },
                            "end": {
                                "line": 822,
                                "col": 30,
                                "offset": 33998
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 824,
                                "col": 0,
                                "offset": 34000
                            },
                            "end": {
                                "line": 824,
                                "col": 23,
                                "offset": 34023
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 826,
                                "col": 0,
                                "offset": 34025
                            },
                            "end": {
                                "line": 829,
                                "col": 2,
                                "offset": 34336
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 831,
                                "col": 0,
                                "offset": 34338
                            },
                            "end": {
                                "line": 834,
                                "col": 2,
                                "offset": 34541
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 836,
                                "col": 0,
                                "offset": 34543
                            },
                            "end": {
                                "line": 836,
                                "col": 61,
                                "offset": 34604
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 838,
                                "col": 0,
                                "offset": 34606
                            },
                            "end": {
                                "line": 841,
                                "col": 2,
                                "offset": 34985
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 843,
                                "col": 0,
                                "offset": 34987
                            },
                            "end": {
                                "line": 846,
                                "col": 2,
                                "offset": 35322
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 848,
                                "col": 0,
                                "offset": 35324
                            },
                            "end": {
                                "line": 851,
                                "col": 2,
                                "offset": 35442
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 853,
                                "col": 0,
                                "offset": 35444
                            },
                            "end": {
                                "line": 856,
                                "col": 2,
                                "offset": 35743
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 858,
                                "col": 0,
                                "offset": 35745
                            },
                            "end": {
                                "line": 861,
                                "col": 2,
                                "offset": 36166
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 863,
                                "col": 0,
                                "offset": 36168
                            },
                            "end": {
                                "line": 866,
                                "col": 2,
                                "offset": 36495
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 868,
                                "col": 0,
                                "offset": 36497
                            },
                            "end": {
                                "line": 871,
                                "col": 2,
                                "offset": 36743
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 873,
                                "col": 0,
                                "offset": 36745
                            },
                            "end": {
                                "line": 876,
                                "col": 2,
                                "offset": 36867
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 878,
                                "col": 0,
                                "offset": 36869
                            },
                            "end": {
                                "line": 881,
                                "col": 2,
                                "offset": 36940
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 883,
                                "col": 0,
                                "offset": 36942
                            },
                            "end": {
                                "line": 886,
                                "col": 2,
                                "offset": 37269
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 888,
                                "col": 0,
                                "offset": 37271
                            },
                            "end": {
                                "line": 888,
                                "col": 18,
                                "offset": 37289
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 890,
                                "col": 0,
                                "offset": 37291
                            },
                            "end": {
                                "line": 893,
                                "col": 2,
                                "offset": 37652
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 895,
                                "col": 0,
                                "offset": 37654
                            },
                            "end": {
                                "line": 898,
                                "col": 2,
                                "offset": 37855
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 900,
                                "col": 0,
                                "offset": 37857
                            },
                            "end": {
                                "line": 903,
                                "col": 2,
                                "offset": 38022
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 905,
                                "col": 0,
                                "offset": 38024
                            },
                            "end": {
                                "line": 908,
                                "col": 8,
                                "offset": 38087
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 910,
                                "col": 0,
                                "offset": 38089
                            },
                            "end": {
                                "line": 913,
                                "col": 2,
                                "offset": 38313
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 915,
                                "col": 0,
                                "offset": 38315
                            },
                            "end": {
                                "line": 915,
                                "col": 22,
                                "offset": 38337
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 917,
                                "col": 0,
                                "offset": 38339
                            },
                            "end": {
                                "line": 920,
                                "col": 2,
                                "offset": 38632
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 922,
                                "col": 0,
                                "offset": 38634
                            },
                            "end": {
                                "line": 922,
                                "col": 34,
                                "offset": 38668
                            }
                        }
                    },
                    {
                        "type": "paragraph",
                        "position": {
                            "start": {
                                "line": 923,
                                "col": 0,
                                "offset": 38669
                            },
                            "end": {
                                "line": 923,
                                "col": 1,
                                "offset": 38670
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 925,
                                "col": 0,
                                "offset": 38672
                            },
                            "end": {
                                "line": 925,
                                "col": 21,
                                "offset": 38693
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 927,
                                "col": 0,
                                "offset": 38695
                            },
                            "end": {
                                "line": 930,
                                "col": 2,
                                "offset": 38939
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 932,
                                "col": 0,
                                "offset": 38941
                            },
                            "end": {
                                "line": 932,
                                "col": 20,
                                "offset": 38961
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 934,
                                "col": 0,
                                "offset": 38963
                            },
                            "end": {
                                "line": 937,
                                "col": 2,
                                "offset": 39130
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 939,
                                "col": 0,
                                "offset": 39132
                            },
                            "end": {
                                "line": 942,
                                "col": 2,
                                "offset": 39356
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 944,
                                "col": 0,
                                "offset": 39358
                            },
                            "end": {
                                "line": 947,
                                "col": 2,
                                "offset": 39608
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 949,
                                "col": 0,
                                "offset": 39610
                            },
                            "end": {
                                "line": 952,
                                "col": 2,
                                "offset": 39870
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 954,
                                "col": 0,
                                "offset": 39872
                            },
                            "end": {
                                "line": 957,
                                "col": 2,
                                "offset": 40102
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 959,
                                "col": 0,
                                "offset": 40104
                            },
                            "end": {
                                "line": 962,
                                "col": 2,
                                "offset": 40183
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 964,
                                "col": 0,
                                "offset": 40185
                            },
                            "end": {
                                "line": 967,
                                "col": 2,
                                "offset": 40439
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 969,
                                "col": 0,
                                "offset": 40441
                            },
                            "end": {
                                "line": 972,
                                "col": 2,
                                "offset": 40591
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 974,
                                "col": 0,
                                "offset": 40593
                            },
                            "end": {
                                "line": 977,
                                "col": 2,
                                "offset": 40759
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 979,
                                "col": 0,
                                "offset": 40761
                            },
                            "end": {
                                "line": 979,
                                "col": 29,
                                "offset": 40790
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 981,
                                "col": 0,
                                "offset": 40792
                            },
                            "end": {
                                "line": 981,
                                "col": 31,
                                "offset": 40823
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 983,
                                "col": 0,
                                "offset": 40825
                            },
                            "end": {
                                "line": 983,
                                "col": 18,
                                "offset": 40843
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 985,
                                "col": 0,
                                "offset": 40845
                            },
                            "end": {
                                "line": 988,
                                "col": 2,
                                "offset": 41137
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 990,
                                "col": 0,
                                "offset": 41139
                            },
                            "end": {
                                "line": 990,
                                "col": 17,
                                "offset": 41156
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 992,
                                "col": 0,
                                "offset": 41158
                            },
                            "end": {
                                "line": 992,
                                "col": 12,
                                "offset": 41170
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 994,
                                "col": 0,
                                "offset": 41172
                            },
                            "end": {
                                "line": 994,
                                "col": 31,
                                "offset": 41203
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 996,
                                "col": 0,
                                "offset": 41205
                            },
                            "end": {
                                "line": 996,
                                "col": 32,
                                "offset": 41237
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 998,
                                "col": 0,
                                "offset": 41239
                            },
                            "end": {
                                "line": 998,
                                "col": 21,
                                "offset": 41260
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 1000,
                                "col": 0,
                                "offset": 41262
                            },
                            "end": {
                                "line": 1000,
                                "col": 16,
                                "offset": 41278
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 1002,
                                "col": 0,
                                "offset": 41280
                            },
                            "end": {
                                "line": 1002,
                                "col": 13,
                                "offset": 41293
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 1004,
                                "col": 0,
                                "offset": 41295
                            },
                            "end": {
                                "line": 1007,
                                "col": 6,
                                "offset": 41344
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 1009,
                                "col": 0,
                                "offset": 41346
                            },
                            "end": {
                                "line": 1012,
                                "col": 6,
                                "offset": 41385
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 1014,
                                "col": 0,
                                "offset": 41387
                            },
                            "end": {
                                "line": 1017,
                                "col": 2,
                                "offset": 41624
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 1019,
                                "col": 0,
                                "offset": 41626
                            },
                            "end": {
                                "line": 1019,
                                "col": 20,
                                "offset": 41646
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 1021,
                                "col": 0,
                                "offset": 41648
                            },
                            "end": {
                                "line": 1024,
                                "col": 2,
                                "offset": 41802
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 1026,
                                "col": 0,
                                "offset": 41804
                            },
                            "end": {
                                "line": 1029,
                                "col": 2,
                                "offset": 42030
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 1031,
                                "col": 0,
                                "offset": 42032
                            },
                            "end": {
                                "line": 1031,
                                "col": 20,
                                "offset": 42052
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 1033,
                                "col": 0,
                                "offset": 42054
                            },
                            "end": {
                                "line": 1036,
                                "col": 2,
                                "offset": 42371
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 1038,
                                "col": 0,
                                "offset": 42373
                            },
                            "end": {
                                "line": 1038,
                                "col": 33,
                                "offset": 42406
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 1040,
                                "col": 0,
                                "offset": 42408
                            },
                            "end": {
                                "line": 1040,
                                "col": 32,
                                "offset": 42440
                            }
                        }
                    },
                    {
                        "type": "callout",
                        "position": {
                            "start": {
                                "line": 1042,
                                "col": 0,
                                "offset": 42442
                            },
                            "end": {
                                "line": 1045,
                                "col": 2,
                                "offset": 42625
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 1047,
                                "col": 0,
                                "offset": 42627
                            },
                            "end": {
                                "line": 1047,
                                "col": 17,
                                "offset": 42644
                            }
                        }
                    }
                ],
                "frontmatter": {
                    "path": "Book Exports/Memory A Very Short Introduction by Jonathan K. Foster.mrexpt",
                    "title": "Memory A Very Short Introduction by Jonathan K. Foster.epub",
                    "author": null,
                    "lastExportedTimestamp": 1649018927425,
                    "lastExportedID": 7087,
                    "tags": [
                        "review/book"
                    ]
                },
                "frontmatterLinks": [],
                "v": 1,
                "frontmatterPosition": {
                    "start": {
                        "line": 0,
                        "col": 0,
                        "offset": 0
                    },
                    "end": {
                        "line": 8,
                        "col": 3,
                        "offset": 251
                    }
                }
            },
            "d8bc1db5bf0b70258fcad87b5558e5b64815e9312abe2430d8b2181969ce0a92": {
                "headings": [
                    {
                        "heading": "Chapter 3: Pulling the rabbit out of the hat",
                        "level": 1,
                        "position": {
                            "start": {
                                "line": 6,
                                "col": 0,
                                "offset": 52
                            },
                            "end": {
                                "line": 6,
                                "col": 46,
                                "offset": 98
                            }
                        }
                    },
                    {
                        "heading": "Relating study and test",
                        "level": 2,
                        "position": {
                            "start": {
                                "line": 8,
                                "col": 0,
                                "offset": 100
                            },
                            "end": {
                                "line": 8,
                                "col": 26,
                                "offset": 126
                            }
                        }
                    }
                ],
                "sections": [
                    {
                        "type": "yaml",
                        "position": {
                            "start": {
                                "line": 0,
                                "col": 0,
                                "offset": 0
                            },
                            "end": {
                                "line": 4,
                                "col": 3,
                                "offset": 50
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 6,
                                "col": 0,
                                "offset": 52
                            },
                            "end": {
                                "line": 6,
                                "col": 46,
                                "offset": 98
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 8,
                                "col": 0,
                                "offset": 100
                            },
                            "end": {
                                "line": 8,
                                "col": 26,
                                "offset": 126
                            }
                        }
                    },
                    {
                        "type": "paragraph",
                        "id": "hjhjhlka",
                        "position": {
                            "start": {
                                "line": 10,
                                "col": 0,
                                "offset": 128
                            },
                            "end": {
                                "line": 11,
                                "col": 22,
                                "offset": 175
                            }
                        }
                    },
                    {
                        "type": "paragraph",
                        "id": "tmi3ktJd",
                        "position": {
                            "start": {
                                "line": 13,
                                "col": 0,
                                "offset": 177
                            },
                            "end": {
                                "line": 15,
                                "col": 33,
                                "offset": 261
                            }
                        }
                    }
                ],
                "blocks": {
                    "hjhjhlka": {
                        "id": "hjhjhlka",
                        "position": {
                            "start": {
                                "line": 10,
                                "col": 0,
                                "offset": 128
                            },
                            "end": {
                                "line": 11,
                                "col": 22,
                                "offset": 175
                            }
                        }
                    },
                    "tmi3ktjd": {
                        "id": "tmi3ktJd",
                        "position": {
                            "start": {
                                "line": 13,
                                "col": 0,
                                "offset": 177
                            },
                            "end": {
                                "line": 15,
                                "col": 33,
                                "offset": 261
                            }
                        }
                    }
                },
                "frontmatter": {
                    "tags": [
                        "review/book",
                        "review/note"
                    ]
                },
                "frontmatterLinks": [],
                "v": 1,
                "frontmatterPosition": {
                    "start": {
                        "line": 0,
                        "col": 0,
                        "offset": 0
                    },
                    "end": {
                        "line": 4,
                        "col": 3,
                        "offset": 50
                    }
                }
            },
            "e15873f463bc22d731a37e67085e3ee89609ca368b298e4951266589fb21cdf1": {
                "tags": [
                    {
                        "tag": "#flashcards",
                        "position": {
                            "start": {
                                "line": 4,
                                "col": 0,
                                "offset": 57
                            },
                            "end": {
                                "line": 4,
                                "col": 11,
                                "offset": 68
                            }
                        }
                    }
                ],
                "sections": [
                    {
                        "type": "yaml",
                        "position": {
                            "start": {
                                "line": 0,
                                "col": 0,
                                "offset": 0
                            },
                            "end": {
                                "line": 2,
                                "col": 3,
                                "offset": 55
                            }
                        }
                    },
                    {
                        "type": "paragraph",
                        "position": {
                            "start": {
                                "line": 4,
                                "col": 0,
                                "offset": 57
                            },
                            "end": {
                                "line": 4,
                                "col": 12,
                                "offset": 69
                            }
                        }
                    },
                    {
                        "type": "paragraph",
                        "position": {
                            "start": {
                                "line": 6,
                                "col": 0,
                                "offset": 71
                            },
                            "end": {
                                "line": 8,
                                "col": 27,
                                "offset": 216
                            }
                        }
                    },
                    {
                        "type": "html",
                        "position": {
                            "start": {
                                "line": 9,
                                "col": 0,
                                "offset": 217
                            },
                            "end": {
                                "line": 9,
                                "col": 36,
                                "offset": 253
                            }
                        }
                    },
                    {
                        "type": "paragraph",
                        "position": {
                            "start": {
                                "line": 11,
                                "col": 0,
                                "offset": 255
                            },
                            "end": {
                                "line": 13,
                                "col": 34,
                                "offset": 359
                            }
                        }
                    },
                    {
                        "type": "html",
                        "position": {
                            "start": {
                                "line": 14,
                                "col": 0,
                                "offset": 360
                            },
                            "end": {
                                "line": 14,
                                "col": 35,
                                "offset": 395
                            }
                        }
                    },
                    {
                        "type": "paragraph",
                        "position": {
                            "start": {
                                "line": 16,
                                "col": 0,
                                "offset": 397
                            },
                            "end": {
                                "line": 18,
                                "col": 53,
                                "offset": 469
                            }
                        }
                    },
                    {
                        "type": "html",
                        "position": {
                            "start": {
                                "line": 19,
                                "col": 0,
                                "offset": 470
                            },
                            "end": {
                                "line": 19,
                                "col": 34,
                                "offset": 504
                            }
                        }
                    }
                ],
                "frontmatter": {
                    "annotations": "[[Atomic Habits/Annotations.md]]"
                },
                "frontmatterLinks": [
                    {
                        "key": "annotations",
                        "link": "Atomic Habits/Annotations.md",
                        "original": "[[Atomic Habits/Annotations.md]]",
                        "displayText": "Atomic Habits/Annotations.md"
                    }
                ],
                "v": 1,
                "frontmatterPosition": {
                    "start": {
                        "line": 0,
                        "col": 0,
                        "offset": 0
                    },
                    "end": {
                        "line": 2,
                        "col": 3,
                        "offset": 55
                    }
                }
            },
            "66ff4e075296545ed04d60ec645b8675328c5ab15448210f0cfe0a7140773a2f": {
                "sections": [
                    {
                        "type": "yaml",
                        "position": {
                            "start": {
                                "line": 0,
                                "col": 0,
                                "offset": 0
                            },
                            "end": {
                                "line": 4,
                                "col": 3,
                                "offset": 56
                            }
                        }
                    },
                    {
                        "type": "paragraph",
                        "position": {
                            "start": {
                                "line": 7,
                                "col": 0,
                                "offset": 59
                            },
                            "end": {
                                "line": 9,
                                "col": 5,
                                "offset": 72
                            }
                        }
                    },
                    {
                        "type": "html",
                        "position": {
                            "start": {
                                "line": 10,
                                "col": 0,
                                "offset": 73
                            },
                            "end": {
                                "line": 10,
                                "col": 37,
                                "offset": 110
                            }
                        }
                    },
                    {
                        "type": "paragraph",
                        "position": {
                            "start": {
                                "line": 12,
                                "col": 0,
                                "offset": 112
                            },
                            "end": {
                                "line": 14,
                                "col": 3,
                                "offset": 123
                            }
                        }
                    },
                    {
                        "type": "html",
                        "position": {
                            "start": {
                                "line": 15,
                                "col": 0,
                                "offset": 124
                            },
                            "end": {
                                "line": 15,
                                "col": 39,
                                "offset": 163
                            }
                        }
                    },
                    {
                        "type": "paragraph",
                        "position": {
                            "start": {
                                "line": 17,
                                "col": 0,
                                "offset": 165
                            },
                            "end": {
                                "line": 19,
                                "col": 8,
                                "offset": 179
                            }
                        }
                    },
                    {
                        "type": "html",
                        "position": {
                            "start": {
                                "line": 20,
                                "col": 0,
                                "offset": 180
                            },
                            "end": {
                                "line": 20,
                                "col": 37,
                                "offset": 217
                            }
                        }
                    },
                    {
                        "type": "paragraph",
                        "position": {
                            "start": {
                                "line": 22,
                                "col": 0,
                                "offset": 219
                            },
                            "end": {
                                "line": 24,
                                "col": 1,
                                "offset": 224
                            }
                        }
                    },
                    {
                        "type": "html",
                        "position": {
                            "start": {
                                "line": 25,
                                "col": 0,
                                "offset": 225
                            },
                            "end": {
                                "line": 25,
                                "col": 37,
                                "offset": 262
                            }
                        }
                    },
                    {
                        "type": "paragraph",
                        "position": {
                            "start": {
                                "line": 27,
                                "col": 0,
                                "offset": 264
                            },
                            "end": {
                                "line": 29,
                                "col": 14,
                                "offset": 307
                            }
                        }
                    },
                    {
                        "type": "html",
                        "position": {
                            "start": {
                                "line": 30,
                                "col": 0,
                                "offset": 308
                            },
                            "end": {
                                "line": 30,
                                "col": 18,
                                "offset": 326
                            }
                        }
                    }
                ],
                "frontmatter": {
                    "annotations": "[[Untitled]]",
                    "tags": [
                        "flashcards"
                    ]
                },
                "frontmatterPosition": {
                    "start": {
                        "line": 0,
                        "col": 0,
                        "offset": 0
                    },
                    "end": {
                        "line": 4,
                        "col": 3,
                        "offset": 56
                    }
                },
                "frontmatterLinks": [
                    {
                        "key": "annotations",
                        "link": "Untitled",
                        "original": "[[Untitled]]",
                        "displayText": "Untitled"
                    }
                ]
            }
        }

        ,
        getFileCache: jest.fn((tfile) => {
            // Return cached metadata for the given TFile.
            // This needs to be dynamic based on the TFile.path
            return { frontmatter: { "annotations": "[[Mock Annotation]]" } }; // Example
        }),
        getFirstLinkpathDest: jest.fn((linkpath, sourcePath) => {
            // Mock behavior for resolving links
            return new MockTFile(linkpath.replace(/\W\[\[|\W\]\]/g, ""));
        }),
    },
    vault: {
        read: jest.fn((tfile) => { // Changed to accept TFile
            // Return a default or specific content for vault.read based on tfile.path
            if (tfile.path === "Atomic Habits/Flashcards.md") {
                return Promise.resolve("---\nannotations: \"[[Atomic Habits/Annotations.md]]\"\n---\n\n#flashcards \n\nFor a habit to persist, you need to keep at it long enough to break through a barrier. What is this barrier called?\n?\nPlateau of Latent Potential\n<!--SR:15538!L,2026-01-29,473,230-->\n\nWhat are the four steps in James Clear's four step model of habits?\n?\ncue, craving, response, and reward\n<!--SR:15505!L,2024-12-04,52,170-->\n\nWhat is a habit?\n?\nRoutine or behavior performed regularly/automatically\n<!--SR:15496!L,2024-10-30,3,250-->\n");
            } else if (tfile.path === "sample path") {
                return Promise.resolve("This is a question\n?\nThis is an answer\n<!--SR:93813-->\n\nThis is a question\n?\nThis is an answer\n<!--SR:93813!L,2021-04-05,99,270-->");
            }
            return Promise.resolve("Mock file content for " + tfile.path);
        }),
        getAbstractFileByPath: jest.fn((path) => {
            // Return a mock TFile object
            return new MockTFile(path);
        }),
        append: jest.fn(() => Promise.resolve()),
        modify: jest.fn(() => Promise.resolve()),
        create: jest.fn(() => Promise.resolve()),
    }
};

module.exports = {
    moment: mockMoment, // Export the callable mock with static methods attached
    moment_2: moment_2,
    PluginSettingTab: jest.fn().mockImplementation(),
    Plugin: jest.fn(() => ({})),
    Platform: {
        get isMobile() {
            return jest.fn(() => false);
        },
    },
    Notice: jest.fn(),
    Modal: jest.fn((app) => ({
        app: app,
        modalEl: { addClass: jest.fn() },
        close: jest.fn(),
        onOpen: jest.fn(),
        onClose: jest.fn(),
    })),
    app: app, // Export the app object
    TFile: MockTFile // Export TFile
};