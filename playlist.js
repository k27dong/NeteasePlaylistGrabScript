const {
  user_playlist,
  playlist_detail,
  song_detail,
} = require("NeteaseCloudMusicApi")

const get_user_playlist = async (id) => {
  let playlist_data = await user_playlist({
    uid: id,
  })

  playlist_data = playlist_data.body
  let playlist = []

  if (
    playlist_data.playlist.length === 1 &&
    playlist_data.playlist[0].name.includes("我喜欢的音乐") &&
    playlist_data.playlist[0].creator === null
  ) {
    return playlist
  }

  for (let p of playlist_data.playlist) {
    if (p.creator.userId === id) {
      playlist.push({
        name: p.name,
        value: p.id,
        description: `${p.trackCount} songs`,
      })
    }
  }

  return playlist
}

const get_songs_from_playlist = async (id) => {
  let playlist_data = await playlist_detail({
    id: id,
  })

  playlist_data = playlist_data.body

  let raw_songs = []
  let songs = []

  if (playlist_data.code === 404) {
    console.log("get_songs_from_playlist: playlist not found")
    return raw_songs
  }

  raw_songs = playlist_data.playlist.trackIds
  total_ids = ""

  for (let s of raw_songs) {
    if (total_ids === "") {
      total_ids += `${s.id}`
    } else {
      total_ids += `,${s.id}`
    }
  }

  let song_data = await song_detail({
    ids: total_ids,
  })

  song_data = song_data.body.songs

  for (let s of song_data) {
    songs.push({
      name: s.name,
      id: s.id,
      artist: s.ar[0].name,
      album: s.al.name,
      cover: s.al.picUrl,
    })
  }

  return songs
}

exports.get_songs_from_playlist = get_songs_from_playlist
exports.get_user_playlist = get_user_playlist
