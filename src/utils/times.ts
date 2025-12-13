// TODO: owleliaで公開したい

export const VALID_TIME_REGEXP = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

export function toDisplayFooter(seconds: number) {
  const hour = (seconds / (60 * 60)) | 0;
  const min = ((seconds % (60 * 60)) / 60) | 0;
  return hour > 0 ? `${hour}時間${min}分` : `${min}分`;
}
