export default class BBCode {
  private codes: any[]

  /**
   * @param {Object} codes
   */
  constructor(codes) {
    this.codes = []

    this.setCodes(codes)
  }

  /**
   * parse
   *
   * @param {String} text
   * @returns {String}
   */
  parse(text) {
    return this.codes.reduce((text, code) => text.replace(code.regexp, code.replacement), text)
  }

  /**
   * add bb codes
   *
   * @param {String} regex
   * @param {String} replacement
   * @returns {BBCode}
   */
  add(regex, replacement) {
    this.codes.push({
      regexp: new RegExp(regex, 'igms'),
      replacement: replacement
    })

    return this
  }

  /**
   * set bb codes
   *
   * @param {Object} codes
   * @returns {BBCode}
   */
  setCodes(codes) {
    this.codes = Object.keys(codes).map(function (regex) {
      const replacement = codes[regex]

      return {
        regexp: new RegExp(regex, 'igms'),
        replacement: replacement
      }
    }, this)

    return this
  }
}
