const fs = require("fs")
const path = require("path")
const axios = require("axios")
const yaml = require("js-yaml")

const prepare_output_dir = (output_path) => {
  if (fs.existsSync(output_path)) {
    fs.rmSync(output_path, { recursive: true, force: true })
  }
  fs.mkdirSync(output_path, { recursive: true })
}

const get_filename_from_url = (url) => {
  return url.split("/").pop().split("?")[0]
}

const save_file_from_url = async (url, output_path) => {
  const filename = get_filename_from_url(url)
  const file_path = path.join(output_path, filename)

  try {
    const response = await axios({ url, responseType: "stream" })
    const writer = fs.createWriteStream(file_path)

    response.data.pipe(writer)

    return new Promise((resolve, reject) => {
      writer.on("finish", () => resolve(filename))
      writer.on("error", reject)
    })
  } catch (error) {
    console.error(`Error downloading file from ${url}: ${error}`)
    return null
  }
}

const write_songs_to_file = async (songs) => {
  const output_dir = "./output"

  prepare_output_dir(output_dir)

  const info = []

  for (const song of songs) {
    const song_dir = path.join(output_dir, song.md5)
    fs.mkdirSync(song_dir, { recursive: true })

    const audio_filename = await save_file_from_url(song.url, song_dir)
    const cover_filename = await save_file_from_url(song.cover, song_dir)
    const lyrics_filename = "lyrics.txt"

    if (audio_filename && cover_filename) {
      fs.writeFileSync(path.join(song_dir, lyrics_filename), song.lyric)

      info.push({
        id: song.md5,
        title: song.name,
        artist: song.artist,
        album: song.album,
        cover: cover_filename,
        audio: audio_filename,
        lyrics: lyrics_filename,
      })
    }
  }

  fs.writeFileSync(`${output_dir}/info.yaml`, yaml.dump(info))
  console.log("All songs processed successfully.")
}

exports.write_songs_to_file = write_songs_to_file
