import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
const Connect = () => {
  //Custom Version of Rainbowkit Connect Button
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;
        return (
          <div
            className="flex"
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <div className="p-[1px] hover:bg-base-green hover:nohover:bg-background text-white shadow-fuller shadow-gray-600 hover:text-base-green hover:nohover:text-white rounded-full">
                    <button
                      className="flex bg-navbar rounded-full text-[10px] sm:text-xl p-[1px] sm:p-2 text-nowrap px-2 sm:px-4"
                      onClick={openConnectModal}
                      type="button"
                    >
                      Connect Wallet
                    </button>
                  </div>
                );
              }
              if (chain.unsupported) {
                return (
                  <button onClick={openChainModal} type="button">
                    Wrong network
                  </button>
                );
              }
              return (
                <div className={`text-white flex items-center`}>
                  <button
                    className="rounded-full h-fit p-[1px] bg-text text-text shadow-fuller hover:bg-base-green hover:text-base-green mr-2 md:mr-8"
                    onClick={openChainModal}
                    style={{ display: "flex", alignItems: "center" }}
                    type="button"
                  >
                    {chain.hasIcon && (
                      <div
                        className="flex overflow-hidden rounded-full bg-navbar"
                        style={{
                          background: chain.iconBackground,
                        }}
                      >
                        {chain.iconUrl && (
                          <Image
                            className=" w-[14px] sm:w-[20px] md:w-[30px] h-fit text-accent"
                            alt={chain.name ?? "Chain icon"}
                            src={chain.iconUrl}
                            width={30}
                            height={20}
                          />
                        )}
                      </div>
                    )}
                  </button>
                  <button
                    onClick={openAccountModal}
                    className={`flex flex-col text-xs px-2 shadow-fuller shadow-gray-600 xs:py-2 md:text-[13px] md:flex-row lg:text-[16px] bg-navbar text-white justify-center hover:shadow-base-green hover:text-base-green nohover:shadow-base-green nohover:text-base-green rounded-full  overflow-hidden`}
                    type="button"
                  >
                    <p className="text-nowrap"> {account.displayName}</p>
                    <div className="hidden sm:flex ">
                      {account.displayBalance
                        ? ` (${account.displayBalance})`
                        : ""}
                    </div>
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

export default Connect;
