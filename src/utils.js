
export function sort_unique(arr) {
  if (arr.length === 0) return arr;
  arr = arr.sort();
  let ret = [arr[0]];
  for (let i = 1; i < arr.length; i++) { //Start loop at 1: arr[0] can never be a duplicate
    if (arr[i-1] !== arr[i]) {
      ret.push(arr[i]);
    }
  }
  return ret;
}
