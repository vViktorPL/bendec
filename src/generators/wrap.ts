import * as _ from 'lodash'
import { genReadFields } from './read'

const genWrap = (obj, write, path = []) => {

  return _.map(obj, (v, k) => {

    if (_.isArray(v)) {
      return [
        `set ${k}(v) {\n`,
        `throw 'no support'\n`,
        `},\n`,
        `get ${k}() {\n`,
        `throw 'no support'\n`,
        `},\n`
      ].join('')
    }

    if (_.isObject(v)) {
      const gend = genWrap(v, write, [...path, k]).join('')
      return [
        //`set ${k}(v) { for (let k in v) { this.${k}[k] = v[k] } },\n`,
        `${k}: {\n`,
        `${gend}\n`,
        `},\n`
      ].join('')
    }

    let writeStatement = _.get(write, [...path, k])
    let w = `set ${k}(v) { ${writeStatement} },\n`
    let r = `get ${k}() { return ${v} },\n`
    return w + r
  })
}

const genWrapFunction = (readers, writers, lookup, name) => {

  let [read] = genReadFields(readers, lookup)(name)
  let [write] = genReadFields(writers, lookup)(name)

  let setBuffer = `setBuffer(b) { buffer = b; return this },\n`
  let getBuffer = `getBuffer(b) { buffer },\n`
  let all = genWrap(read, write).join('') + setBuffer + getBuffer

  let body = `var buffer = buf\n` + 
             `return { ${all} }\n`
  return new Function('buf', body)
}

export { genWrapFunction }
