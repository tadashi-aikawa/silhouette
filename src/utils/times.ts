// TODO: owleliaで公開したい

export const VALID_TIME_REGEXP = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

const pad00 = (v: number) => String(v).padStart(2, "0");

export function toHHmmss(seconds: number) {
  const hour = (seconds / (60 * 60)) | 0;
  const min = ((seconds % (60 * 60)) / 60) | 0;
  const sec = seconds % 60;
  return `${pad00(hour)}:${pad00(min)}:${pad00(sec)}`;
}

export function toDisplayFooter(seconds: number) {
  const hour = (seconds / (60 * 60)) | 0;
  const min = ((seconds % (60 * 60)) / 60) | 0;
  return hour > 0 ? `${hour}時間${min}分` : `${min}分`;
}
