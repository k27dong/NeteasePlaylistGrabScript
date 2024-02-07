const { song_url, lyric } = require("NeteaseCloudMusicApi")

const get_song_url_by_id = async (id, cookie) => {
  let song_url_data = await song_url({
    id: id,
    cookie: cookie,
    br: 320000, // 320kbps, should be enough
    realIP: "221.192.199.49",
  })

  song_url_data = song_url_data.body

  let url = song_url_data.data[0].url
  let code = song_url_data.data[0].code
  let md5 = song_url_data.data[0].md5

  if (code !== 200) {
    console.log(`get_song_url_by_id: failed with ${code}`)
  }

  return [url, md5]
}

const get_lyric_by_id = async (id) => {
  let lyric_data = await lyric({
    id: id,
  })

  lyric_data = lyric_data.body

  return lyric_data.lrc.lyric
}

const populate_song_with_url_and_lyric = async (songs, cookie) => {
  for (let song of songs) {
    let [url, md5] = await get_song_url_by_id(song.id, cookie)
    song.url = url
    song.md5 = md5

    let lyric = await get_lyric_by_id(song.id)
    song.lyric = lyric
  }

  return songs
}

exports.populate_song_with_url_and_lyric = populate_song_with_url_and_lyric
