import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { LogOut, Flame, Sun, Moon } from 'lucide-react';
import { Button } from './ui/button';

const Header = () => {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-transparent z-10 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Left Side */}
        <div className="flex items-center space-x-6">
          <span className="font-bold text-xl">taskboard</span>
          <Link href="/analytics" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            analytics
          </Link>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">toggle theme</span>
          </Button>
          <div className="flex items-center space-x-1 text-sm text-orange-500">
            <Flame size={16} />
            <span>{session?.user?.streak ?? 0}d streak</span>
          </div>
          {session?.user?.image && (
            <Image
              src={session.user.image}
              alt="user avatar"
              width={32}
              height={32}
              className="rounded-full"
            />
          )}
          <Button variant="destructive" size="sm" onClick={() => signOut()}>
            <LogOut className="mr-2 h-4 w-4" /> sign out
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
