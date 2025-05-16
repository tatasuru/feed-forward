export const useSessionId = () => {
  const COOKIE_NAME = "feedforward_session";
  const FEEDBACK_PREFIX = "feedback_";
  const EXPIRES_DAYS = 30;

  function getSessionId() {
    const cookieValue = useCookie(COOKIE_NAME).value;
    if (cookieValue) {
      return cookieValue;
    }

    const newSessionId = generateSessionId();
    useCookie(COOKIE_NAME, { maxAge: EXPIRES_DAYS * 24 * 60 * 60 }).value =
      newSessionId;
    return newSessionId;
  }

  function clearFeedbackId(shortId: string): void {
    const key = `${FEEDBACK_PREFIX}${shortId}`;
    deleteCookie(key);
  }

  function generateSessionId() {
    const randomPart = Math.random().toString(36).substring(2, 15);
    const timestamp = Date.now().toString(36);
    return `${FEEDBACK_PREFIX}${randomPart}${timestamp}`;
  }

  function setCookie(name: string, value: string, days: number) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = "expires=" + date.toUTCString();

    document.cookie = `${name}=${value}; expires=${expires} path=/; SameSite=Lax; Secure`;
  }

  function getCookie(name: string) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }

    return null;
  }

  function deleteCookie(sessionId: string): void {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }

  function setFeedbackId(shortId: string, feedbackId: string): void {
    const key = `${FEEDBACK_PREFIX}${shortId}`;
    setCookie(key, feedbackId, EXPIRES_DAYS);
  }

  function getFeedbackId(shortId: string): string | null {
    const key = `${FEEDBACK_PREFIX}${shortId}`;
    return getCookie(key);
  }

  function setSessionCookie(
    sessionId: string,
    feedbackId: string,
    days: number
  ): void {
    setCookie(sessionId, feedbackId, days);
  }

  function getSessionCookie(sessionId: string): string | null {
    return getCookie(sessionId);
  }

  function deleteSessionCookie(sessionId: string): void {
    deleteCookie(sessionId);
  }

  return {
    getSessionId,
    setFeedbackId,
    getFeedbackId,
    clearFeedbackId,
    setSessionCookie,
    getSessionCookie,
    deleteSessionCookie,
    generateSessionId,
    setCookie,
    getCookie,
    deleteCookie,
  };
};
