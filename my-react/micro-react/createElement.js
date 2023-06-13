const createElement = (type, props, ...children) => {
  return {
    type,
    props: {
      // 展开props中的每一项
      ...props,
      children: children.map(item => typeof item === 'object' ? item : createTextElement(item))
    }
  }
}

const createTextElement= (text) => {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      // nodeValue被认为是文本节点的值
      nodeValue: text,
      children: []
    }
  }
}
export default createElement;