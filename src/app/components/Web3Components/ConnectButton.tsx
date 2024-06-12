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
                  <div className="rounded-full p-[1px] text-white shadow-fuller shadow-gray-600 hover:bg-base-green hover:text-base-green hover:nohover:bg-background hover:nohover:text-white">
                    <button
                      className="flex text-nowrap rounded-full bg-navbar p-[1px] px-2 text-[10px] sm:p-2 sm:px-4 sm:text-xl"
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
                <div className={`flex items-center text-white`}>
                  <button
                    className="mr-2 h-fit rounded-full bg-text p-[1px] text-text shadow-fuller hover:bg-base-green hover:text-base-green md:mr-8"
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
                            className="h-fit w-[14px] text-accent sm:w-[20px] md:w-[30px]"
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
                    className={`flex flex-col justify-center overflow-hidden rounded-full bg-navbar px-2 text-xs text-white shadow-fuller shadow-gray-600 hover:text-base-green hover:shadow-base-green xs:py-2 md:flex-row md:text-[13px] lg:text-[16px] nohover:text-base-green nohover:shadow-base-green`}
                    type="button"
                  >
                    <p className="text-nowrap"> {account.displayName}</p>
                    <div className="hidden sm:flex">
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
