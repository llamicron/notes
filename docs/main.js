// Append the class name with no spaces (ie. PHYS1444) to get all the files in that dir
const url_base = "https://api.github.com/repos/llamicron/notes/contents/notes/";
const url_end = "?recursive=1";
// I know, I know, this isn't secure. I don't care.
const token = ["7b", "b6", "0a", "c2", "76", "fc", "5e", "e9", "8e", "e3", "d0", "09", "ab", "aa", "ef", "85", "ac", "14", "3f", "0f"];
const allowed_files = ["pdf", "md"];



var app = new Vue({
    el: "#content",
    data: {
        classes: [],
        // This is the current set of active notes
        // clicking a class will populate this with that classes notes
        activeClass: {},
        notes: [],
        searchTerm: "",
        searchResults: [],
        fuse: {},
        loadingClasses: true,
    },
    methods: {
        getClassList() {
            const Http = new XMLHttpRequest();
            Http.open("GET", url_base);
            Http.setRequestHeader("Authorization", "token " + token.join(""));
            Http.send();
            Http.onreadystatechange = (e) => {
                let resp = JSON.parse(Http.response);

                resp.forEach(cls => {
                    let match = /(\d*)$/.exec(cls.name);
                    if (match.index != -1) {
                        cls.prettyName = [cls.name.slice(0, match.index), " ", cls.name.slice(match.index)].join("");
                    } else {
                        cls.prettyName = cls.name;
                    }
                });

                this.classes = resp;
                this.loadingClasses = false;
            }
        },

        setActiveClass(cls) {
            this.activeClass = cls;

            const Http = new XMLHttpRequest();
            Http.open("GET", cls.url);

            Http.setRequestHeader("Authorization", "token " + token.join(""));

            Http.send();

            Http.onreadystatechange = (e) => {
                let resp = JSON.parse(Http.response);
                if (resp.message == "Not Found") {
                    console.log("not found");
                    this.notes = [];
                } else {
                    this.notes = resp.filter((note) => {
                        let pieces = note.name.split(".");
                        return allowed_files.includes(pieces[pieces.length - 1]);
                    });
                    this.initializeFuse();
                }
            }

        },

        resetSearch() {
            this.searchResults = this.notes;
        },

        initializeFuse() {
            this.resetSearch();
            this.fuse = new Fuse(this.notes, {
                keys: ["name", "path"]
            });
        },

        search() {
            if (this.searchTerm == "") {
                this.resetSearch();
            } else {
                this.searchResults = this.fuse.search(this.searchTerm).map(obj => obj.item);
            }
            console.log(this.searchResults);
        },


        previewNote(note) {
            // If the note is a PDF, render and display the first page
            // If it's markdown, send them to github for it to display
            if (note.name.endsWith(".md")) {
                window.open(note.html_url, "_blank");
            } else {
                this.loadNotePdf(note);
            }
        },

        loadNotePdf(note) {
            var loadingTask = pdfjsLib.getDocument(note.download_url);
            loadingTask.promise.then(function(pdf) {
                pdf.getPage(1).then(function(page) {
                    var scale = 1.2;
                    var viewport = page.getViewport({ scale: scale, });

                    var canvas = document.getElementById('pdf');
                    var context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    var renderContext = {
                        canvasContext: context,
                        viewport: viewport,
                    };
                    page.render(renderContext);
                });
            });
        },

        openGithub() {
            window.open("https://github.com/llamicron/notes", "_blank");
        },

        shareNote(note) {
            navigator.clipboard.writeText(note.download_url);
            UIkit.notification("URL Copied");
        }
    },

    mounted() {
        this.getClassList();
    },


    watch: {
        searchTerm: function () { this.search() }
    }
})
