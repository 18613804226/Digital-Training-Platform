import { e as deleteCookie, g as setCookie, h as getCookie } from './nitro.mjs';

function clearRefreshTokenCookie(event) {
  deleteCookie(event, "jwt", {
    httpOnly: true,
    sameSite: "none",
    secure: true
  });
}
function setRefreshTokenCookie(event, refreshToken) {
  setCookie(event, "jwt", refreshToken, {
    httpOnly: true,
    maxAge: 24 * 60 * 60,
    // unit: seconds
    sameSite: "none",
    secure: true
  });
}
function getRefreshTokenFromCookie(event) {
  const refreshToken = getCookie(event, "jwt");
  return refreshToken;
}

export { clearRefreshTokenCookie as c, getRefreshTokenFromCookie as g, setRefreshTokenCookie as s };
//# sourceMappingURL=cookie-utils.mjs.map
