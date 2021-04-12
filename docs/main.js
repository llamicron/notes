// Temporary, replace with the one on master
const INDEX_URL = "https://raw.githubusercontent.com/llamicron/notes/rust/notes.index";
const PREVIEW_BASE = "https://github.com/llamicron/notes/tree/rust/notes/";
const DOWNLOAD_BASE = "https://github.com/llamicron/notes/raw/rust/notes/";
const BAD_FILES = [".gitkeep", ".DS_Store"];
// I know, I know, this isn't secure. I don't care.
const token = ["7b", "b6", "0a", "c2", "76", "fc", "5e", "e9", "8e", "e3", "d0", "09", "ab", "aa", "ef", "85", "ac", "14", "3f", "0f"];
// const allowed_files = ["pdf", "md"];



var app = new Vue({
    el: "#content",
    data: {
        classList: {}
    },
    methods: {
        getClassList() {
            const Http = new XMLHttpRequest();
            Http.open("GET", INDEX_URL);
            Http.send();

            Http.onreadystatechange = () => {
                // Flat array of strings
                files = JSON.parse(Http.responseText);
                // Remove ../notes/ from strings
                for (i = 0; i < files.length; i++) {
                    file = files[i].slice(9, files[i].length);
                    pieces = file.split('/');
                    // Skip loose things directly in notes/
                    if (pieces.length < 2) {
                        continue;
                    }
                    cls = pieces[0];
                    pieces.shift();
                    filename = pieces.join('/');
                    if (!this.classList[cls]) {
                        this.classList[cls] = [];
                    }
                    this.classList[cls].push(filename);
                }

                this.cleanClassList();
                this.$forceUpdate();
            }
        },

        cleanClassList() {
            for ([cls, files] of Object.entries(this.classList)) {
                // Remove duplicates
                this.classList[cls] = [...new Set(files)];
                
                // Remove resctricted files
                this.classList[cls] = this.classList[cls].filter((file) => BAD_FILES.indexOf(file) == -1);
            }
        },

        download(note) {
            window.open(DOWNLOAD_BASE + note);
        },

        preview(note) {
            window.open(PREVIEW_BASE + note);
        },

        classes() {
            return Object.keys(this.classList);
        },

        openGithub() {
            window.open("https://github.com/llamicron/notes/tree/master/notes");
        }
    },

    mounted() {
        this.getClassList();
    },

})
