const { cloudsearch } = require("NeteaseCloudMusicApi")

const get_user = async (username) => {
  let profile_data = await cloudsearch({
    keywords: username,
    type: 1002,
  })

  return !profile_data.body.result.userprofiles
    ? null
    : profile_data.body.result.userprofiles[0]
}

exports.get_user = get_user
