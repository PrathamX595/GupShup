interface SystemMessage {
  message: string;
}

const SystemMsg = ({ message }: SystemMessage) => {
    return (
    <div className="flex w-full justify-center">
      <div className="w-full flex justify-center my-0.5 max-w-md break-words  px-5 rounded-xl text-sm">
        {message}
      </div>
    </div>
  );
};

export default SystemMsg