using Microsoft.EntityFrameworkCore;
using server.Models;

namespace server.Data;

public class ReviewDbContext(DbContextOptions<ReviewDbContext> options) : DbContext(options)
{
    public DbSet<Review> Reviews => Set<Review>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Review>(entity =>
        {
            entity.ToTable("Reviews");
            entity.HasKey(r => r.Id);
            entity.Property(r => r.Id).ValueGeneratedOnAdd();
            entity.Property(r => r.Name).IsRequired().HasMaxLength(100);
            entity.Property(r => r.Rating).IsRequired();
            entity.Property(r => r.Text).IsRequired().HasMaxLength(2000);
            entity.Property(r => r.Service).HasMaxLength(100);
            entity.Property(r => r.FlaggedReason).HasMaxLength(500);
            entity.Property(r => r.ClientIpHash).HasMaxLength(128);
            entity.HasIndex(r => r.Status);
        });
    }
}