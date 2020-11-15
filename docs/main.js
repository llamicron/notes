// Append the class name with no spaces (ie. PHYS1444) to get all the files in that dir
const url_base = "https://api.github.com/repos/llamicron/notes/contents/classes/";
const url_end = "?recursive=1";
// I know, I know, this isn't secure. I don't care.
const token = ["7b", "b6", "0a", "c2", "76", "fc", "5e", "e9", "8e", "e3", "d0", "09", "ab", "aa", "ef", "85", "ac", "14", "3f", "0f"];

var app = new Vue({
    el: "#content",
    data: {
        classes: ["PHYS 1444", "CSE 1325", "CSE 2315", "MATH 2425"],
        // This is the current set of active notes
        // clicking a class will populate this with that classes notes
        activeClass: "",
        notes: []
    },
    methods: {
        setActiveClass(cls) {
            // With a space
            this.activeClass = cls;
            // Now remove the space
            cls = cls.replace(" ", "");

            const Http = new XMLHttpRequest();
            let url = url_base + cls + url_end;
            Http.open("GET", url);
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
    }
})
