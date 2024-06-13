import { TokenData } from "@/app/page"
import Image from "next/image"
const TokenMetadata = ({token}:{token:TokenData}) => {
    
    if(token.metaData.name==="")
        return <div>Not Found</div>
    return (
    <div className="flex flex-col items-center">
        {"Logo"}
        <Image
          className="mx-2 rounded-[100%] shadow-fuller shadow-gray-200"
          src={
            token.metaData?.logo ?? "https://picsum.photos/200"
          }
          alt=""
          style={{
            width: "40px",
            height: "40px",
          }}
          width={30}
          height={30}
        ></Image>
        <p>Name: {token.metaData?.name}</p>
        <p>Symbol: {token.metaData?.symbol}</p>
        <p>Decimals: {token.metaData?.decimals}</p>
        <p>Balance: {token.balance}</p>
      </div>
      )
}

export default TokenMetadata;