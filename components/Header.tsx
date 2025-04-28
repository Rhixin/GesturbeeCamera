export default function Header() {
  return (
    <header className="flex items-center justify-between mb-4">
      <div className="flex items-center">
        <img
          src="/assets/images/Bee.png"
          alt="Bee logo"
          width={100}
          height={100}
          className="mr-4"
        />
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-[#FBBC05]">
          GesturBee
        </h1>
      </div>
    </header>
  );
}
