const {
  login_qr_key,
  login_qr_create,
  login_qr_check,
} = require("NeteaseCloudMusicApi")
const QRCode = require("qrcode")
const MAX_DURATION = 60 * 1000 // 1 min

const login_qrcode = async () => {
  try {
    console.log(`Logging in ...`)

    let qr_key_res = await login_qr_key()
    qr_key_res = qr_key_res.body

    let qr_code_res = await login_qr_create({
      key: qr_key_res.data.unikey,
    })
    qr_code_res = qr_code_res.body

    QRCode.toString(
      qr_code_res.data.qrurl,
      { type: "terminal" },
      function (err, url) {
        console.log(url)
      }
    )

    let cookie_res
    let is_done = false
    let elapsed = 0

    const interval = setInterval(async () => {
      if (is_done || elapsed >= MAX_DURATION) {
        clearInterval(interval)
        return
      }

      cookie_res = await login_qr_check({
        key: qr_key_res.data.unikey,
      })

      if (cookie_res.body.code === 803) {
        is_done = true
        clearInterval(interval)
      } else if (cookie_res.body.code === 800) {
        clearInterval(interval)
      }

      elapsed += 1000
    }, 1000) // check every second

    // wait until the QR code is scanned or expired
    while (!is_done && elapsed < MAX_DURATION) {
      await new Promise((resolve) => setTimeout(resolve, 2000))
    }

    return is_done ? cookie_res.body.cookie : null
  } catch (err) {
    console.error(err)
    return null
  }
}

exports.login_qrcode = login_qrcode
