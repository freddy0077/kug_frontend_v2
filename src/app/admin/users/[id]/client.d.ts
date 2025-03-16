declare module './client' {
  interface UserDetailsClientProps {
    userId: string;
  }
  
  const UserDetailsClient: React.FC<UserDetailsClientProps>;
  export default UserDetailsClient;
}
