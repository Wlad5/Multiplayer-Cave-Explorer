interface MessageProps {
    message:string
}
export const Message: React.FC<MessageProps> = ({ message }) => {
    return (
        <div className="message">
            {message}
        </div>
    )
}