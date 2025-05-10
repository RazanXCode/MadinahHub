using MHBackend.Data;
using Microsoft.EntityFrameworkCore;
using MHBackend.Auth;
using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using MHBackend.Repositories;
using Microsoft.AspNetCore.Authentication;
using MHBackend.Services;
using System.Text.Json.Serialization;
using MHBackend.Hubs; // Add this for SignalR Hubs

var builder = WebApplication.CreateBuilder(args);

// Initialize Firebase Admin SDK
FirebaseApp.Create(new AppOptions
{
    Credential = GoogleCredential.FromFile("./Secrets/fir-fbe50-firebase-adminsdk-fbsvc-d437111a10.json"),
});

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });
builder.Services.AddEndpointsApiExplorer();

// Add SignalR
builder.Services.AddSignalR(options =>
{
    // Make hub methods wait for authentication
    options.EnableDetailedErrors = true; // Enable detailed errors for debugging
});
// Add CORS for Angular frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp",
    builder => builder
            .WithOrigins("http://localhost:4200")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()); // Important for SignalR
});

// Add Swagger for API documentation
builder.Services.AddSwaggerGen();

// Register Database service
builder.Services.AddDbContext<MyAppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
);

// Add Services
builder.Services.AddSingleton<IQRCodeService, QRCodeService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IChatService, ChatService>();

// Add Repositories
builder.Services.AddScoped<IUserRepository, UserRepository>();

// Register ISmsService and SmsService
builder.Services.Configure<TwilioSettings>(options => {
    options.AccountSid = Environment.GetEnvironmentVariable("TWILIO_ACCOUNT_SID");
    options.AuthToken = Environment.GetEnvironmentVariable("TWILIO_AUTH_TOKEN");
    options.PhoneNumber = Environment.GetEnvironmentVariable("TWILIO_PHONE_NUMBER");
});
builder.Services.AddScoped<ISmsService, SmsService>();

// Register INotificationService and NotificationService
builder.Services.AddScoped<INotificationService, NotificationService>();

// Add Firebase authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = "Firebase";
    options.DefaultChallengeScheme = "Firebase";
})
.AddScheme<AuthenticationSchemeOptions, FirebaseAuthenticationHandler>("Firebase", null);

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "API v1");
    });
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<ChatHub>("/chatHub"); // Map SignalR hub
app.UseCors("AllowAngularApp");

app.Run();