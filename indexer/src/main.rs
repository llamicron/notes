use std::{fs::File, io::Write};
use walkdir::WalkDir;

pub const NOTES_DIR: &'static str = "../notes/";
pub const INDEX_PATH: &'static str = "../notes.index";


fn main() {
    let mut files: Vec<String> = vec![];

    // This gets a list of all files in the notes dir
    for entry in WalkDir::new(NOTES_DIR).min_depth(1).max_depth(5) {
        let entry = entry.unwrap();
        let path = entry.path();
        if path.is_file() {
            files.push(format!("{}", path.display()));
        }
    }


    // This writes all files to notes.index in valid JSON format
    let mut file = File::create(INDEX_PATH).unwrap();
    let serialized = serde_json::to_string_pretty(&files).unwrap();
    file.write_all(serialized.as_bytes()).unwrap();
}
