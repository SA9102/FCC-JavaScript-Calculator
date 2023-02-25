export default function Button({id, className, value, onClick}) {
    const isOperator = '+-*/'.includes(value) ? true : false
    return <button id={id} className={className} onClick={() => onClick(value, isOperator)}>{value}</button>
}