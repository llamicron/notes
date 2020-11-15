// Append the class name with no spaces (ie. PHYS1444) to get all the files in that dir
const url_base = "https://api.github.com/repos/llamicron/notes/contents/classes/";
const url_end = "?recursive=1";
// I know, I know, this isn't secure. I don't care.
const token = ["7b", "b6", "0a", "c2", "76", "fc", "5e", "e9", "8e", "e3", "d0", "09", "ab", "aa", "ef", "85", "ac", "14", "3f", "0f"];

var app = new Vue({
    el: "#content",
    data: {
        classes: [],
        // This is the current set of active notes
        // clicking a class will populate this with that classes notes
        activeClass: {},
        notes: [],
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
                    cls.prettyName = [cls.name.slice(0, 4), " ", cls.name.slice(4)].join("");
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
                    this.notes = resp;
                }
            }

        }
    },
    mounted() {
        this.getClassList();
    }
})
