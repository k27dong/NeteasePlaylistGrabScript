const { login_qrcode } = require("./login")
const { get_user } = require("./user")
const { get_user_playlist, get_songs_from_playlist } = require("./playlist")
const { populate_song_with_url_and_lyric } = require("./song")
const { write_songs_to_file } = require("./output")
const select = require("@inquirer/select").default

let cookie
const username = "麻辣烤鱼别放大葱"

async function main() {
  // login
  login_qrcode().then((res) => {
    if (!res) {
      console.log("running without logging in")
    } else {
      cookie = res
      console.log("Netease logged in!")
    }
  })

  // retrieve playlist from username
  const user = await get_user(username)
  const playlist = await get_user_playlist(user.userId)

  // select the playlist to be grabbed
  const playlist_id = await select({
    message: "Select the playlist to grab:",
    choices: playlist,
  })

  // retrieve songs from playlist
  const songs = await get_songs_from_playlist(playlist_id)

  // populate songs with urls and other info
  const songs_with_info = await populate_song_with_url_and_lyric(songs, cookie)

  // write to file
  await write_songs_to_file(songs_with_info)
}

main()
