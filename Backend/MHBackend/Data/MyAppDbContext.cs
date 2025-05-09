using Microsoft.EntityFrameworkCore;
using MHBackend.Models;

namespace MHBackend.Data
{

    public class MyAppDbContext : DbContext
    {
        public MyAppDbContext(DbContextOptions<MyAppDbContext> options) : base(options) { }

        // DbSet 
        public DbSet<User> Users { get; set; }
        public DbSet<UserCommunity> UserCommunities { get; set; }
        public DbSet<Event> Events { get; set; }
        public DbSet<Community> Communities { get; set; }
        public DbSet<Ticket> Tickets { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<Message> Messages { get; set; }
        public DbSet<DeviceToken> DeviceTokens { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {

            // Enum-to-String Conversion
            modelBuilder.Entity<User>()
                .Property(u => u.Role)
                .HasConversion<string>();

            modelBuilder.Entity<Event>()
                .Property(e => e.Status)
                .HasConversion<string>();

            modelBuilder.Entity<Event>()
                .Property(e => e.EventType)
                .HasConversion<string>();

            modelBuilder.Entity<Booking>()
                .Property(b => b.Status)
                .HasConversion<string>();

            modelBuilder.Entity<Ticket>()
                .Property(t => t.Status)
                .HasConversion<string>();

            modelBuilder.Entity<Message>()
                .Property(m => m.Status)
                .HasConversion<string>();

            // Composite primary key for join table
            modelBuilder.Entity<UserCommunity>()
                .HasKey(uc => new { uc.UserId, uc.CommunityId });

            // User - UserCommunity (1-to-many) & Community - UserCommunity (1-to-many)
            modelBuilder.Entity<UserCommunity>()
                .HasOne(uc => uc.User)
                .WithMany(u => u.UserCommunities)
                .HasForeignKey(uc => uc.UserId)
                .OnDelete(DeleteBehavior.Cascade);  // On delete, remove all related UserCommunity entries
            modelBuilder.Entity<UserCommunity>()
                .HasOne(uc => uc.Community)
                .WithMany(c => c.UserCommunities)
                .HasForeignKey(uc => uc.CommunityId)
                .OnDelete(DeleteBehavior.Cascade);  // On delete, remove all related UserCommunity entries


            // Event - User (Many-to-1)
            modelBuilder.Entity<Event>()
                .HasOne(e => e.Creator)
                .WithMany(u => u.EventsCreated)
                .HasForeignKey(e => e.CreatedBy)
                .OnDelete(DeleteBehavior.Cascade);  // On delete, remove all related Event entries


            // Community - Event (1-to-many)
            modelBuilder.Entity<Event>()
                .HasOne(e => e.Community)
                .WithMany(c => c.Events)
                .HasForeignKey(e => e.CommunityId)
                .OnDelete(DeleteBehavior.Cascade);  // On delete, remove all related Event entries


            // Ticket - Event (Many-to-1)
            modelBuilder.Entity<Ticket>()
                .HasOne(t => t.Event)
                .WithMany(e => e.Tickets)
                .HasForeignKey(t => t.EventId)
               .OnDelete(DeleteBehavior.Restrict);  // on event delete, delete all its Tickets 


            // Booking - User (Many-to-1)
            modelBuilder.Entity<Booking>()
                .HasOne(b => b.User)
                .WithMany(u => u.Bookings)
                .HasForeignKey(b => b.UserId)
                .OnDelete(DeleteBehavior.Cascade);  // On delete, remove all related Booking entries


            // Notification - Booking (Many-to-1)
            modelBuilder.Entity<Notification>()
                .HasOne(n => n.Booking)
                .WithMany(b => b.Notifications)
                .HasForeignKey(n => n.BookingId)
                .OnDelete(DeleteBehavior.Cascade);  // On delete, remove all related Notification entries

            // Notification - User (Many-to-1)
            modelBuilder.Entity<Notification>()
                .HasOne(n => n.User)
                .WithMany(u => u.Notifications)
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.NoAction);

            // Message - User & Community (Many-to-1)
            modelBuilder.Entity<Message>()
                .HasOne(m => m.User)
                .WithMany(u => u.Messages)
                .HasForeignKey(m => m.UserId)
                .OnDelete(DeleteBehavior.Cascade);  // On delete, remove all related Message entries

            modelBuilder.Entity<Message>()
                .HasOne(m => m.Community)
                .WithMany(c => c.Messages)
                .HasForeignKey(m => m.CommunityId)
                .OnDelete(DeleteBehavior.Cascade);  // On delete, remove all related Message entries

            // DeviceToken - User (Many-to-1)
            modelBuilder.Entity<DeviceToken>()
                .HasOne(dt => dt.User)
                .WithMany(u => u.DeviceTokens)
                .HasForeignKey(dt => dt.UserId)
                .OnDelete(DeleteBehavior.Cascade);

        }
    }
}